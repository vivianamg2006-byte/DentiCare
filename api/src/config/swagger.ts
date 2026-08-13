import swaggerJSDoc from "swagger-jsdoc";

export const swaggerOptions: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "TechEvents CR API",
            version: "1.0.0",
            description: "Documentación del API para gestión de eventos tecnológicos.",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Servidor local",
            },
        ],

        components: {
            schemas: {

                Category: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        name: { type: "string", example: "Desarrollo Web" },
                        description: {
                            type: "string",
                            nullable: true,
                            example: "Eventos relacionados con desarrollo web"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time"
                        }
                    }
                },

                Tag: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        name: { type: "string", example: "React" }
                    }
                },

                RegistrationStatus: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        name: { type: "string", example: "Registrado" }
                    }
                },

                UserRole: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        name: { type: "string", example: "ADMIN" }
                    }
                },

                User: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        email: {
                            type: "string",
                            example: "ana@email.com"
                        },
                        fullName: {
                            type: "string",
                            example: "Ana Rodríguez"
                        },
                        roleId: {
                            type: "integer",
                            example: 2
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time"
                        },
                        role: {
                            $ref: "#/components/schemas/UserRole"
                        }
                    }
                },

                Organizer: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        name: {
                            type: "string",
                            example: "Universidad Técnica Nacional"
                        },
                        description: {
                            type: "string",
                            nullable: true,
                            example: "Organizador principal"
                        },
                        imageUrl: {
                            type: "string",
                            nullable: true,
                            example: "/images/utn.png"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time"
                        }
                    }
                },

                Event: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        title: {
                            type: "string",
                            example: "Conferencia React"
                        },
                        description: {
                            type: "string",
                            example: "Evento sobre React y APIs"
                        },
                        date: {
                            type: "string",
                            format: "date-time",
                            example: "2026-07-20T18:00:00.000Z"
                        },
                        location: {
                            type: "string",
                            example: "San José"
                        },
                        modality: {
                            type: "string",
                            example: "Presencial"
                        },
                        totalCapacity: {
                            type: "integer",
                            example: 100
                        },
                        isActive: {
                            type: "boolean",
                            example: true
                        },
                        imageUrl: {
                            type: "string",
                            nullable: true,
                            example: "/images/react-event.png"
                        },
                        categoryId: {
                            type: "integer",
                            example: 1
                        },
                        organizerId: {
                            type: "integer",
                            example: 1
                        },

                        category: {
                            $ref: "#/components/schemas/Category"
                        },

                        organizer: {
                            $ref: "#/components/schemas/Organizer"
                        },

                        tags: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/Tag"
                            }
                        }
                    }
                },

                Registration: {
                    type: "object",
                    properties: {
                        eventId: {
                            type: "integer",
                            example: 1
                        },
                        userId: {
                            type: "integer",
                            example: 2
                        },
                        statusId: {
                            type: "integer",
                            example: 1
                        },
                        registeredAt: {
                            type: "string",
                            format: "date-time"
                        },

                        event: {
                            $ref: "#/components/schemas/Event"
                        },

                        user: {
                            $ref: "#/components/schemas/User"
                        },

                        status: {
                            $ref: "#/components/schemas/RegistrationStatus"
                        }
                    }
                },

                EventInput: {
                    type: "object",
                    required: [
                        "title",
                        "description",
                        "date",
                        "location",
                        "modality",
                        "totalCapacity",
                        "categoryId",
                        "organizerId"
                    ],
                    properties: {
                        title: {
                            type: "string",
                            example: "Conferencia React"
                        },
                        description: {
                            type: "string",
                            example: "Evento sobre React"
                        },
                        date: {
                            type: "string",
                            format: "date-time"
                        },
                        location: {
                            type: "string",
                            example: "San José"
                        },
                        modality: {
                            type: "string",
                            example: "Presencial"
                        },
                        totalCapacity: {
                            type: "integer",
                            example: 100
                        },
                        isActive: {
                            type: "boolean",
                            example: true
                        },
                        imageUrl: {
                            type: "string",
                            example: "/images/react-event.png"
                        },
                        categoryId: {
                            type: "integer",
                            example: 1
                        },
                        organizerId: {
                            type: "integer",
                            example: 1
                        },
                        tagIds: {
                            type: "array",
                            items: {
                                type: "integer"
                            },
                            example: [1, 2, 3]
                        }
                    }
                },

                RegistrationInput: {
                    type: "object",
                    required: [
                        "eventId",
                        "userId"
                    ],
                    properties: {
                        eventId: {
                            type: "integer",
                            example: 1
                        },
                        userId: {
                            type: "integer",
                            example: 2
                        },
                        statusId: {
                            type: "integer",
                            example: 1
                        }
                    }
                },

                RegisterUserInput: {
                    type: "object",
                    required: [
                        "email",
                        "password",
                        "fullName"
                    ],
                    properties: {
                        email: {
                            type: "string",
                            example: "ana@email.com"
                        },
                        password: {
                            type: "string",
                            example: "123456"
                        },
                        fullName: {
                            type: "string",
                            example: "Ana Rodríguez"
                        },
                        roleId: {
                            type: "integer",
                            example: 2
                        }
                    }
                },

                LoginInput: {
                    type: "object",
                    required: [
                        "email",
                        "password"
                    ],
                    properties: {
                        email: {
                            type: "string",
                            example: "ana@email.com"
                        },
                        password: {
                            type: "string",
                            example: "123456"
                        }
                    }
                },

                ImageUploadResponse: {
                    type: "object",
                    properties: {
                        fileName: {
                            type: "string",
                            example: "1718460000000-react.png"
                        },
                        imageUrl: {
                            type: "string",
                            example: "/images/1718460000000-react.png"
                        }
                    }
                }
            }
        }
    },

    apis: ["./src/routes/*.ts"]
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);