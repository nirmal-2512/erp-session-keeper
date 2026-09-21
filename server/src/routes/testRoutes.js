// // server/src/routes/testRoutes.js

// import express from "express";
// import { sendOTPEmail } from "../services/otpService.js";

// const router = express.Router();

// router.get("/email", async (req, res) => {
//   try {
//     const result = await sendOTPEmail(
//       "nirmal25.iitkgp@gmail.com",
//       "Nirmal",
//       "123456"
//     );

//     console.log("Brevo result:", result);

//     res.json({
//       success: true,
//       message: "Email request sent to Brevo",
//     });
//   } catch (error) {
//     console.error("Brevo error:", error);

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// export default router;