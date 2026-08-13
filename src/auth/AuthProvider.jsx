import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import PropTypes from "prop-types"
import { AuthContext } from "./AuthContext"
import { getProfile, loginUser, registerUser as registerUserRequest } from "../services/authService"

const TOKEN_KEY = "token"

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)
    const isMounted = useRef(true)

    const isAuthenticated = Boolean(token && user)

    useEffect(() => {
        isMounted.current = true
        return () => {
            isMounted.current = false
        }
    }, [])

    const clearSession = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY)
        if (isMounted.current) {
            setToken(null)
            setUser(null)
        }
    }, [])

    const login = useCallback(async (email, password) => {
        const newToken = await loginUser(email, password)
        const profile = await getProfile(newToken)
        localStorage.setItem(TOKEN_KEY, newToken)
        if (isMounted.current) {
            setToken(newToken)
            setUser(profile)
        }
        return profile
    }, [])

    const registerUser = useCallback(async (userData) => {
        return await registerUserRequest(userData)
    }, [])

    const logout = useCallback(() => {
        clearSession()
    }, [clearSession])

    const hasRole = useCallback((allowedRoles) => {
        return Boolean(user?.role?.name && allowedRoles.includes(user.role.name))
    }, [user])

    useEffect(() => {
        async function restoreSession() {
            const savedToken = localStorage.getItem(TOKEN_KEY)
            if (!savedToken) {
                if (isMounted.current) {
                    setLoading(false)
                }
                return
            }
            try {
                const profile = await getProfile(savedToken)
                if (isMounted.current) {
                    setToken(savedToken)
                    setUser(profile)
                }
            } catch {
                clearSession()
            } finally {
                if (isMounted.current) {
                    setLoading(false)
                }
            }
        }
        restoreSession()
    }, [clearSession])

    const value = useMemo(
        () => ({
            user,
            token,
            loading,
            isAuthenticated,
            login,
            logout,
            registerUser,
            hasRole,
        }),
        [user, token, loading, isAuthenticated, login, logout, registerUser, hasRole]
    )

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
}
