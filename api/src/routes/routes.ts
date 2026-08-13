import { Router } from 'express';
import { CategoryRoutes } from './category.routes';
import { TagRoutes } from './tag.routes';
import { RegistrationStatusRoutes } from './registration-status.routes';
import { UserRoleRoutes } from './user-role.routes';
import { UserRoutes } from './user.routes';
import { EventRoutes } from './event.routes';
import { RegistrationRoutes } from './registration.routes';
import { ImageRoutes } from './image.routes';
import { OrganizerRoutes } from './organizer.routes';


export class AppRoutes {
    static get routes(): Router {
        const router = Router();
        // ----Agregar las rutas----
        router.use("/categories", CategoryRoutes.routes);
        router.use("/tags", TagRoutes.routes);
        router.use("/registration-statuses", RegistrationStatusRoutes.routes);
        router.use("/user-roles", UserRoleRoutes.routes);
        router.use("/organizers", OrganizerRoutes.routes);
        router.use("/users", UserRoutes.routes);
        router.use("/events", EventRoutes.routes);
        router.use("/registrations", RegistrationRoutes.routes);
        router.use("/images", ImageRoutes.routes);

        return router;
    }
}
