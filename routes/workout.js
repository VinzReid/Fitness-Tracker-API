const express = require("express");
const workoutController = require("../controllers/workout.js");
const auth = require("../auth.js");

const { verify } = auth;

//[SECTION] Routing Component
const router = express.Router();

//[SECTION] Routes
router.post("/addWorkout", verify, workoutController.addWorkout);
router.get("/getMyWorkouts", verify, workoutController.getMyWorkouts);
router.patch(
  "/updateWorkout/:workoutId",
  verify,
  workoutController.updateWorkout
);
router.delete(
  "/deleteWorkout/:workoutId",
  verify,
  workoutController.deleteWorkout
);
router.patch(
  "/completeWorkoutStatus/:workoutId",
  workoutController.completeWorkoutStatus
);

module.exports = router;
