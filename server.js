const express=require("express");
const mysql=require("mysql2/promise");
const cors=require("cors");
const os=require("os");

const app=express();
const PORT=3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const dbConfig={
	host:process.env.DB_HOST||"mysql-service",
	user:process.env.DB_USER||"root",
	password:process.env.DB_PASSWORD||"root123",
	database:process.env.DB_NAME||"oslabdb"
};

async function getConnection(){
	return await mysql.createConnection(dbConfig);
}

async function initDB(){
	let connection;
	try{
		connection=await getConnection();
		await connection.execute(`
			CREATE TABLE IF NOT EXISTS messages(
				id INT AUTO_INCREMENT PRIMARY KEY,
				name VARCHAR(100) NOT NULL,
				email VARCHAR(150) NOT NULL,
				message TEXT NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)
		`);
		console.log("Database ready");
	}catch(error){
		console.error("Database initialization failed:",error.message);
	}finally{
		if(connection) await connection.end();
	}
}

app.get("/api/health",(req,res)=>{
	res.json({
		status:"healthy",
		pod:os.hostname(),
		app:"Kubernetes OS Lab Portal"
	});
});

app.post("/api/messages",async(req,res)=>{
	const {name,email,message}=req.body;

	if(!name||!email||!message){
		return res.status(400).json({error:"All fields are required"});
	}

	let connection;
	try{
		connection=await getConnection();
		await connection.execute(
			"INSERT INTO messages(name,email,message) VALUES(?,?,?)",
			[name,email,message]
		);
		res.json({success:true,message:"Message saved successfully"});
	}catch(error){
		res.status(500).json({error:error.message});
	}finally{
		if(connection) await connection.end();
	}
});

app.get("/api/messages",async(req,res)=>{
	let connection;
	try{
		connection=await getConnection();
		const [rows]=await connection.execute("SELECT * FROM messages ORDER BY id DESC");
		res.json(rows);
	}catch(error){
		res.status(500).json({error:error.message});
	}finally{
		if(connection) await connection.end();
	}
});

app.listen(PORT,async()=>{
	console.log(`Server running on port ${PORT}`);
	await initDB();
});
