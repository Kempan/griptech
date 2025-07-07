import { Router} from "express";
import { getSession, loginUser, logoutUser } from "../../controllers/public/authController";

const router = Router();

router.get("/session", getSession);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

export default router;
