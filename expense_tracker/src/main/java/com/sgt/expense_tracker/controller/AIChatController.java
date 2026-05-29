package com.sgt.expense_tracker.controller;

import com.sgt.expense_tracker.config.AIToolsConfig;
import com.sgt.expense_tracker.model.ChatHistory;
import com.sgt.expense_tracker.service.ChatHistoryService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class AIChatController {

    private final ChatClient chatClient;
    private final ChatHistoryService chatHistoryService;

    private static final String SYSTEM_PROMPT = """
            You are a smart personal expense tracking assistant.
            You have access to tools that fetch real user data from the database.
            
            STRICT RULES:
            - ALWAYS call the relevant tool before answering any question about expenses, budget, or spending.
            - NEVER give generic advice — always base your response on actual tool results.
            - Present tool results in a clean, formatted way using emojis and bullet points.
            - If user asks for financial advice or suggestions, ALWAYS call getFinancialAdvice tool first.
            - If user asks about budget status, ALWAYS call checkBudgetStatus tool first.
            - If user asks about spending summary, ALWAYS call getSpendingAnalysis tool first.
            - If user wants to log/add/save an expense, ALWAYS call saveExpenseTool.
            """;

    public AIChatController(ChatClient.Builder chatClientBuilder,
                            AIToolsConfig aiToolsConfig,
                            ChatHistoryService chatHistoryService) {
        this.chatClient = chatClientBuilder
                .defaultTools(aiToolsConfig)
                .defaultSystem(SYSTEM_PROMPT)
                .build();
        this.chatHistoryService = chatHistoryService;
    }

    @PostMapping(value = "/chat", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public String chatWithAI(
            @RequestParam("message") String message,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "sessionId") String sessionId
    ) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            // Step 1: Past history fetch karo via service
            List<ChatHistory> pastMessages = chatHistoryService.getHistoryBySessionId(sessionId);

            // Step 2: Last 10 messages only — token usage kam karo
            List<Message> messageHistory = new ArrayList<>();
            int start = Math.max(0, pastMessages.size() - 10);
            List<ChatHistory> recentMessages = pastMessages.subList(start, pastMessages.size());

            for (ChatHistory ch : recentMessages) {
                if ("user".equals(ch.getRole())) {
                    messageHistory.add(new UserMessage(ch.getContent()));
                } else {
                    messageHistory.add(new AssistantMessage(ch.getContent()));
                }
            }

            String aiResponse;

            // Step 3: Image hai toh multimodal, warna normal
            if (file != null && !file.isEmpty()) {
                byte[] fileBytes = file.getBytes();
                String contentType = file.getContentType();
                var mimeType = (contentType != null) ? MimeTypeUtils.parseMimeType(contentType) : MimeTypeUtils.IMAGE_JPEG;
                var imageResource = new ByteArrayResource(fileBytes);

                String dynamicPrompt = message.isBlank()
                        ? "Analyze this receipt image closely. Extract the total amount spent, identify the most appropriate category, and then automatically use the 'saveExpenseTool' to log it into the system."
                        : message + " (Use the attached receipt image to extract data and trigger 'saveExpenseTool')";

                aiResponse = this.chatClient.prompt()
                        .messages(messageHistory)
                        .user(u -> u.text(dynamicPrompt).media(mimeType, imageResource))
                        .call()
                        .content();
            } else {
                aiResponse = this.chatClient.prompt()
                        .messages(messageHistory)
                        .user(message)
                        .call()
                        .content();
            }

            // Step 4: Save karo via service
            chatHistoryService.saveMessage(sessionId, username, "user", message);
            String safeResponse = (aiResponse != null) ? aiResponse : "No response received.";
            chatHistoryService.saveMessage(sessionId, username, "assistant", safeResponse);

            return safeResponse;

        } catch (Exception e) {
            System.out.println("Chat Error: " + e.getMessage());
            return "Error processing your request: " + e.getMessage();
        }
    }

    // Naya session start karne ke liye
    @GetMapping("/chat/session")
    public String newSession() {
        return java.util.UUID.randomUUID().toString();
    }

    // Session ki poori history fetch karne ke liye
    @GetMapping("/chat/history/{sessionId}")
    public List<ChatHistory> getChatHistory(@PathVariable String sessionId) {
        return chatHistoryService.getHistoryBySessionId(sessionId);
    }
}