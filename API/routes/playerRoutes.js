import express from 'express';
import { getAllPlayers, getPlayer, addPlayer, updatePlayer, deletePlayer } from '../controllers/playerController.js';
import { protect } from '../controllers/authController.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router.route('/')
  .get(getAllPlayers)
  .post(addPlayer);

router.route('/:id')
  .get(getPlayer)
  .patch(updatePlayer)
  .delete(deletePlayer);

export default router;