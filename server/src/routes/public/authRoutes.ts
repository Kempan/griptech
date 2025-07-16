import { Router} from "express";
import { getSession, loginUser, logoutUser, refreshToken } from "../../controllers/public/authController";

const router = Router();

router.get("/session", getSession);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh", refreshToken);

export default router;
