package com.anrymart.webdev.controller

import com.anrymart.webdev.jpa.User
import com.anrymart.webdev.model.EmailSendRequest
import com.anrymart.webdev.repository.UserRepository
import com.anrymart.webdev.service.EmailService
import com.anrymart.webdev.web.ResponseMessage
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = ["*"], maxAge = 3600)
class BackendController {

    @Autowired
    lateinit var userRepository: UserRepository

    @Autowired
    lateinit var emailService: EmailService

    @GetMapping("/usercontent")
    @PreAuthorize("hasAnyRole({'USER', 'ADMIN'})")
    fun getUserContent(authentication: Authentication): String {
        val user: User = userRepository.findByUsername(authentication.name).get()
        return "Hello " + user.firstName + " " + user.lastName + "!"
    }

    @GetMapping("/admincontent")
    @PreAuthorize("hasRole('ADMIN')")
    fun getAdminContent(): String {
        return "Admin's content"
    }

    @PostMapping("/send-email")
    fun sendSimpleEmail(@RequestBody request: EmailSendRequest): ResponseEntity<*> {
        try {
            emailService.sendSimpleMessage(request.to, request.subject, request.body)
        } catch (e: Exception) {
            return ResponseEntity(ResponseMessage("Error while sending message"), HttpStatus.BAD_REQUEST)
        }
        return ResponseEntity(ResponseMessage("Email has been sent"), HttpStatus.OK)
    }
}