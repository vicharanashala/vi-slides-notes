import { io } from "socket.io-client";

const socket = io("http://localhost:5000");
const sessionCode = "TEST12";

socket.on("connect", () => {
    console.log("Connected to WebSocket Server:", socket.id);

    socket.emit("join_session", sessionCode);
    console.log("Joined Session:", sessionCode);

    setTimeout(() => {
        console.log("\n[1] Sending a complex question to AI Triage...");
        socket.emit("send_question", {
            sessionCode: sessionCode,
            question: "Can you explain the philosophical implications of quantum mechanics on human free will?",
            isAnonymous: false
        });
    }, 1000);
});

socket.on("receive_question", (data) => {
    console.log("[SUCCESS ✓] Complex Question properly forwarded to Teacher stream:");
    console.log(data);

    setTimeout(() => {
        console.log("\n[2] Sending a simple factual question to AI Triage...");
        socket.emit("send_question", {
            sessionCode: sessionCode,
            question: "What is 2+2?",
            isAnonymous: true
        });
    }, 1000);
});

socket.on("auto_answer", (data) => {
    console.log("[SUCCESS ✓] Simple Question properly auto-answered by AI fallback (bypassed teacher):");
    console.log(data);
    console.log("\n--- Full Backend WebSockets Integration Test Passed! ---");
    process.exit(0);
});

setTimeout(() => {
    console.error("\n[X] Test timed out! Server didn't respond in time.");
    process.exit(1);
}, 10000);
