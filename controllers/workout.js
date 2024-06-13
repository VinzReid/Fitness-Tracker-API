const Workout = require("../models/Workout.js");
const { errorHandler } = require("../auth.js");
const mongoose = require("mongoose");

module.exports.addWorkout = async (req, res) => {
  try {
    const userId = req.user.id;
    let { name, duration } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).send({ error: "Valid name is required" });
    }
    if (
      !duration ||
      typeof duration !== "string" ||
      duration.trim().length === 0
    ) {
      return res.status(400).send({ error: "Valid duration is required" });
    }

    if (!/\d/.test(duration) || !/[a-zA-Z]/.test(duration)) {
      return res
        .status(400)
        .send({ error: "Duration must contain both numbers and letters" });
    }

    const existingWorkout = await Workout.findOne({
      name: name.trim(),
      duration,
      status: "pending",
    });

    if (existingWorkout) {
      return res
        .status(400)
        .send({ error: "Workout already exists with pending status" });
    }

    const newWorkout = new Workout({
      userId: new mongoose.Types.ObjectId(userId),
      name: name.trim(),
      duration,
    });

    const savedWorkout = await newWorkout.save();

    res.status(201).send(savedWorkout);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports.getMyWorkouts = async (req, res) => {
  try {
    const userId = req.user.id;
    const workouts = await Workout.find({ userId });
    res.status(200).send({ workouts });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports.updateWorkout = async (req, res) => {
  try {
    const { name, duration, status } = req.body;
    const { workoutId } = req.params;

    const existingWorkout = await Workout.findById(workoutId);
    if (!existingWorkout) {
      return res.status(404).send({ error: "Workout not found" });
    }
    const updatedWorkout = await Workout.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(workoutId) },
      { name, duration, status },
      { new: true }
    );
    res.status(200).send({
      message: "Workout Updated successfully",
      updatedWorkout: updatedWorkout,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports.deleteWorkout = async (req, res) => {
  try {
    const { workoutId } = req.params;

    const existingWorkout = await Workout.findById(workoutId);
    if (!existingWorkout) {
      return res.status(404).send({ error: "Workout not found" });
    }

    await Workout.deleteOne({ _id: new mongoose.Types.ObjectId(workoutId) });
    res.status(200).send({ message: "Workout Deleted successfully" });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports.completeWorkoutStatus = async (req, res) => {
  try {
    const { workoutId } = req.params;

    const existingWorkout = await Workout.findById(workoutId);
    if (!existingWorkout) {
      return res.status(404).send({ error: "Workout not found" });
    }

    const updatedWorkout = await Workout.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(workoutId) },
      { status: "completed" },
      { new: true }
    );
    res.status(200).send({
      message: "Workout status updated successfully",
      updatedWorkout: updatedWorkout,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};
