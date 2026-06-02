const form=document.getElementById("messageForm");
const list=document.getElementById("messageList");
const toast=document.getElementById("toast");
const liveStatus=document.getElementById("liveStatus");
const podName=document.getElementById("podName");
const healthFill=document.getElementById("healthFill");
const refreshBtn=document.getElementById("refreshBtn");
const menuToggle=document.getElementById("menuToggle");
const navLinks=document.getElementById("navLinks");

menuToggle.addEventListener("click",()=>{
	navLinks.classList.toggle("open");
});

document.querySelectorAll(".nav-links a").forEach(link=>{
	link.addEventListener("click",()=>{
		navLinks.classList.remove("open");
	});
});

function showToast(message,type="success"){
	toast.textContent=message;
	toast.style.background=type==="error"?"#8f1d35":"#102033";
	toast.classList.add("show");
	setTimeout(()=>toast.classList.remove("show"),2800);
}

function formatDate(value){
	try{
		return new Date(value).toLocaleString();
	}catch{
		return value;
	}
}

async function loadHealth(){
	try{
		const res=await fetch("/api/health");
		const data=await res.json();

		liveStatus.textContent=data.status==="healthy"?"Healthy":"Unknown";
		liveStatus.style.background="rgba(88,255,163,.15)";
		liveStatus.style.color="#bfffd8";
		liveStatus.style.borderColor="rgba(88,255,163,.22)";

		podName.textContent=data.pod||"Unavailable";
		healthFill.style.width="100%";
	}catch(error){
		liveStatus.textContent="Offline";
		liveStatus.style.background="rgba(255,107,107,.15)";
		liveStatus.style.color="#ffd5d5";
		liveStatus.style.borderColor="rgba(255,107,107,.2)";
		podName.textContent="Unavailable";
		healthFill.style.width="18%";
	}
}

async function loadMessages(){
	list.innerHTML=`
		<div class="empty-state">
			<p>Loading messages...</p>
		</div>
	`;

	try{
		const res=await fetch("/api/messages");
		const messages=await res.json();

		if(!Array.isArray(messages)||!messages.length){
			list.innerHTML=`
				<div class="empty-state">
					<p>No messages yet. Submit one to test persistence.</p>
				</div>
			`;
			return;
		}

		list.innerHTML=messages.map(item=>`
			<div class="message-card">
				<h4>${escapeHTML(item.name)}</h4>
				<div class="message-meta">
					<span>${escapeHTML(item.email)}</span>
					<span>•</span>
					<span>${formatDate(item.created_at)}</span>
				</div>
				<p>${escapeHTML(item.message)}</p>
			</div>
		`).join("");
	}catch(error){
		list.innerHTML=`
			<div class="empty-state">
				<p>Failed to load messages.</p>
			</div>
		`;
	}
}

function escapeHTML(str){
	return String(str)
		.replaceAll("&","&amp;")
		.replaceAll("<","&lt;")
		.replaceAll(">","&gt;")
		.replaceAll('"',"&quot;")
		.replaceAll("'","&#039;");
}

form.addEventListener("submit",async(e)=>{
	e.preventDefault();

	const submitBtn=form.querySelector("button[type='submit']");
	const originalText=submitBtn.innerHTML;

	const data={
		name:document.getElementById("name").value.trim(),
		email:document.getElementById("email").value.trim(),
		message:document.getElementById("message").value.trim()
	};

	if(!data.name||!data.email||!data.message){
		showToast("Please fill all fields","error");
		return;
	}

	submitBtn.disabled=true;
	submitBtn.innerHTML="<span>Saving...</span>";

	try{
		const res=await fetch("/api/messages",{
			method:"POST",
			headers:{"Content-Type":"application/json"},
			body:JSON.stringify(data)
		});

		const result=await res.json();

		if(result.success){
			form.reset();
			await loadMessages();
			showToast("Message saved in MySQL successfully");
		}else{
			showToast(result.error||"Something went wrong","error");
		}
	}catch(error){
		showToast("Failed to connect to server","error");
	}finally{
		submitBtn.disabled=false;
		submitBtn.innerHTML=originalText;
	}
});

refreshBtn.addEventListener("click",loadMessages);

function animateCounters(){
	const counters=document.querySelectorAll(".counter");

	counters.forEach(counter=>{
		const target=Number(counter.dataset.target);
		let current=0;
		const increment=Math.max(1,Math.ceil(target/40));

		const update=()=>{
			current+=increment;
			if(current>target) current=target;
			counter.textContent=current;
			if(current<target) requestAnimationFrame(update);
		};

		update();
	});
}

function setupReveal(){
	const elements=document.querySelectorAll(".reveal");

	const observer=new IntersectionObserver(entries=>{
		entries.forEach(entry=>{
			if(entry.isIntersecting){
				entry.target.classList.add("visible");
			}
		});
	},{threshold:.12});

	elements.forEach(el=>observer.observe(el));
}

window.addEventListener("load",()=>{
	setupReveal();
	animateCounters();
	loadHealth();
	loadMessages();
	setInterval(loadHealth,15000);
});
