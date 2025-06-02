import express from "express";
import onboardingController from "./onboarding.controller";
import passport from "../../middlewares/passport.middleware";
import { isAdmin, permit, requiredRoles } from "../../middlewares/auth.middleware";
import { session } from "passport";
const router = express.Router();

router.post('/add-material', passport.authenticate('jwt', { session: false }), requiredRoles(['admin', 'editor']), permit('create'), onboardingController.addOnboardingMaterial);
router.get('/onboarding-materials', passport.authenticate('jwt', { session: false }), requiredRoles(['admin', 'applicant', 'editor']), onboardingController.getScreeningMaterials);
router.put('/update-material', passport.authenticate('jwt',{session:false}),requiredRoles(['admin','editor']),permit('update') ,onboardingController.updateOnboardingMaterial);
router.delete('/delete-materials', passport.authenticate('jwt', { session: false }), isAdmin, permit('delete'), onboardingController.deleteOnboardingMaterial);
router.get('/random-quest', passport.authenticate('jwt', { session: false }), requiredRoles(['applicant','editor']), permit('view'), onboardingController.getRandomQuest);
router.patch('/progress/:materialId', passport.authenticate('jwt', { session: false }), requiredRoles(['applicant']), onboardingController.updateOnboardingProgress);



export default router;