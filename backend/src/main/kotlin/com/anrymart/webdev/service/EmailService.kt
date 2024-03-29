package com.anrymart.webdev.service

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.io.FileSystemResource
import org.springframework.mail.MailException
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.stereotype.Service
import org.thymeleaf.context.Context
import org.thymeleaf.spring5.SpringTemplateEngine
import java.io.File
import javax.mail.MessagingException

@Service
class EmailService {

    @Value("\${anrymart.mail.from}")
    lateinit var sender: String

    @Autowired
    var emailSender: JavaMailSender? = null

    @Autowired
    lateinit var templateEngine: SpringTemplateEngine

    fun sendSimpleMessage(to: String, subject: String, text: String) {
        try {
            val message = SimpleMailMessage()
            message.setTo(to)
            message.setFrom(sender)
            message.setSubject(subject)
            message.setText(text)

            emailSender!!.send(message)
        } catch (exception: MailException) {
            exception.printStackTrace()
        }

    }

    fun sendSimpleMessageUsingTemplate(to: String,
                                       subject: String,
                                       template: String,
                                       params: MutableMap<String, Any>) {
        val message = emailSender!!.createMimeMessage()
        val helper = MimeMessageHelper(message, true, "utf-8")
        val context = Context()
        context.setVariables(params)
        val html: String = templateEngine.process(template, context)

        helper.setTo(to)
        helper.setFrom(sender)
        helper.setText(html, true)
        helper.setSubject(subject)

        emailSender!!.send(message)
    }

    fun sendMessageWithAttachment(to: String,
                                  subject: String,
                                  text: String,
                                  pathToAttachment: String) {
        try {
            val message = emailSender!!.createMimeMessage()
            val helper = MimeMessageHelper(message, true)

            helper.setTo(to)
            helper.setFrom(sender)
            helper.setSubject(subject)
            helper.setText(text)

            val file = FileSystemResource(File(pathToAttachment))
            helper.addAttachment("Invoice", file)
            emailSender!!.send(message)
        } catch (e: MessagingException) {
            e.printStackTrace()
        }

    }

    fun sendHtmlMessage(to: String, subject: String, htmlMsg: String) {
        try {
            val message = emailSender!!.createMimeMessage()
            message.setContent(htmlMsg, "text/html")

            val helper = MimeMessageHelper(message, false, "utf-8")

            helper.setTo(to)
            helper.setFrom(sender)
            helper.setSubject(subject)

            emailSender!!.send(message)
        } catch (exception: MailException) {
            exception.printStackTrace()
        }
    }
}