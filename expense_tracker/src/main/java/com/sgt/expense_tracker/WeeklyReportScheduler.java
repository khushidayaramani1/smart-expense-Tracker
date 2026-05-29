//package com.sgt.expense_tracker;
//
//import com.sgt.expense_tracker.model.Transaction;
//import com.sgt.expense_tracker.model.User;
//import com.sgt.expense_tracker.repository.AuthRepository;
//import com.sgt.expense_tracker.repository.TransactionRepo;
//import jakarta.mail.internet.MimeMessage;
//import org.openpdf.text.Paragraph;
//import org.openpdf.text.pdf.PdfPTable;
//import org.openpdf.text.pdf.PdfTable;
//import org.openpdf.text.pdf.PdfWriter;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.mail.javamail.JavaMailSender;
//import org.springframework.mail.javamail.MimeMessageHelper;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Component;
//
//import javax.swing.text.Document;
//import java.io.ByteArrayOutputStream;
//import java.time.LocalDate;
//import java.util.List;
//
//@Component
//public class WeeklyReportScheduler {
//
//    @Autowired
//    JavaMailSender mailSender;
//    @Autowired
//    AuthRepository authRepo;
//    @Autowired
//    TransactionRepo transactionRepo;
//
//    public void sendMail(String email){
//        try {
//            MimeMessage message = mailSender.createMimeMessage();
//            MimeMessageHelper helper = new MimeMessageHelper(message, true);
//            helper.setTo(email);
//            helper.setSubject("Weekly Expense Report (" + LocalDate.now().minusDays(7)
//                      + " to " +
//                    LocalDate.now()  + ")");
//            User u = authRepo.findUserByEmail(email);
//            if(u==null){
//                System.out.println("user with "+u.getEmail() +"not found");
//            }
//            List<Transaction> transactionsList = transactionRepo.get(
//                    u.getId(),
//                    null,           // category null rakha hai taaki saare types ke expense aayein
//                    LocalDate.now().minusDays(7),
//                    LocalDate.now(),
//                    "EXPENSE",      // type filter specifically expense ke liye
//                    "dateOfTransaction", // date par sort karna report ke liye best hai
//                    "DESC",
//                    "1",            // Page 1 se start karein agar puri report chahiye
//                    "100"           // Report ke liye records per page zyada rakhein (e.g. 100)
//            );
//            String content = "this is your content to download your expense and income report"+
//                    "transactions are ---> "+transactionsList+" from "+LocalDate.now().minusDays(7)
//                    +" to "+LocalDate.now();
//            helper.setText(content,false);
//            mailSender.send(message);
//            System.out.println("mail sent successfull to "+email);
//        }catch(Exception e){
//            System.out.println(email+" is not a valid mail");
//        }
//    }
//
//    @Scheduled(cron = "0 */2 * * * *")
//    public void sendReport(){
//        System.out.println("sending report");
////        List<String> allEmail = authRepo.getAllEmail();
////        for(String e:allEmail){
////            sendMail(e);
////        }
//        sendMail("2023.khushi.dayaramani@ves.ac.in");
//    }
////    List<User> users = authRepo.getAllUser();
////
////    for(User user : users){
////        byte[] report = getReport(user, LocalDate.now().minusDays(7), LocalDate.now());
//            emailService.sendEmailWithAttatchment();
////    }
////
////    public byte[] getReport(User user, LocalDate start, LocalDate end){
////
////    }
//
//
//    public byte[] generatePdf(User user, LocalDate start,LocalDate end){
//        ByteArrayOutputStream out = new ByteArrayOutputStream();
//        Document document = new Document();
//        PdfWriter.getInstance(document,out);
//        document.open();
//        document.add(new Paragraph("Transaction Report"));
//        document.add(new Paragraph("generated on "+LocalDate.now()));
//
//        PdfPTable table = new PdfPTable();
//        table.addCell("Date");
//        table.addCell("Category");
//        table.addCell("Amount");
//
//        for(Transaction t : transactions){
//            table.addCell(t.getDate.toString());
//            table.addCell(t.getCategoryName());
//            table.addCell(String.valueOf(t.getAmount()));
//        }
//
//        document.add(table);
//        document.close();
//        out.toByteArray();
//    }
//
//
//
//}
