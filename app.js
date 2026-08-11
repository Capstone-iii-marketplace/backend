
const express = require("express")
const cors = require("cors")
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors())
app.use(express.json())
db.sync()
app.get('/',(req,res)=>{
    res.json({
        message: "Marketplace API is running"
    })


})
const dbConnection = async () => {
  try {
    await db.sync();
    console.log(" Database is connected");
    
    app.listen(PORT, () => {
      console.log(`Server Running on Port: ${PORT}`);
    });
  } catch (error) {
    console.log("Unabel to connect", error);
  }
}
dbConnection();

