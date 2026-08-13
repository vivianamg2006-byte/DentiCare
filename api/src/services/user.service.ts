import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

export const userService = {
    async listar() {
        return await prisma.user.findMany({
            include: {
                role: true,
            },
            orderBy: { fullName: "asc" },
        });
    },

    async obtenerPorId(id: number) {
        return await prisma.user.findUnique({
            where: { id },
            include: {
                role: true,
            },
        });
    },

    async registrar(data: {
        email: string;
        password: string;
        fullName: string;
        roleId?: number;
    }) {
        const userExists = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (userExists) {
            throw new Error("El correo ya está registrado");
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                fullName: data.fullName,
                roleId: data.roleId ?? 2,
            },
            include: {
                role: true,
            },
        });

        const { password, ...userWithoutPassword } = user;

        return userWithoutPassword;
    },

    async login(data: { email: string; password: string }) {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
            include: {
                role: true,
            },
        });

        if (!user) {
            throw new Error("Correo o contraseña incorrectos");
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            throw new Error("Correo o contraseña incorrectos");
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role.name,
        };

        const secret: Secret = process.env.JWT_SECRET || "techevents_utn_2026";

        const options: SignOptions = {
            expiresIn: "2h",
        };

        const token = jwt.sign(payload, secret, options);

        return {
            token
        };
    },
    async perfil(userId: number) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            role: true
        },
    });

    if (!user) {
        throw new Error("El user no existe");
    }

    const { password, ...userSinPassword } = user;

    return userSinPassword;
},
};