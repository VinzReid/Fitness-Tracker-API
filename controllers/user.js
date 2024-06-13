const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const auth = require("../auth.js");
const { errorHandler } = require("../auth.js");

module.exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, mobileNo, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .send({ error: "User with this email already exists" });
    }
    if (!/^[a-zA-Z\s]+$/.test(firstName) || !/^[a-zA-Z\s]+$/.test(lastName)) {
      return res.status(400).send({
        error: "First and last name must contain only letters and spaces",
      });
    } else if (!firstName.trim() || !lastName.trim()) {
      return res
        .status(400)
        .send({ error: "First and last name must not be empty" });
    } else if (!email.includes("@")) {
      return res.status(400).send({ error: "Invalid email format" });
    } else if (password.length < 8) {
      return res
        .status(400)
        .send({ error: "Password must be at least 8 characters long" });
    } else if (mobileNo.length !== 11) {
      return res.status(400).send({ error: "Mobile number is invalid" });
    }

    let newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      mobileNo: req.body.mobileNo,
      password: bcrypt.hashSync(req.body.password, 10),
    });

    const result = await newUser.save();
    return res.status(201).send({
      message: "User registered successfully",
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

module.exports.loginUser = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !email.includes("@")) {
    return res.status(400).send({ error: "Invalid email format" });
  }

  if (!password) {
    return res.status(400).send({ error: "Password is required" });
  }

  User.findOne({ email: email })
    .then((result) => {
      if (!result) {
        return res.status(404).send({ error: "Email is not registered" });
      }

      console.log("Plain text password:", password);
      console.log("Hashed password from DB:", result.password);

      if (!result.password) {
        return res
          .status(500)
          .send({ error: "User password is not set in the database" });
      }

      const isPasswordCorrect = bcrypt.compareSync(password, result.password);

      if (isPasswordCorrect) {
        return res.status(200).send({
          message: "User logged in successfully",
          access: auth.createAccessToken(result),
        });
      } else {
        return res.status(401).send({ error: "Incorrect email or password" });
      }
    })
    .catch((error) => errorHandler(error, req, res));
};
