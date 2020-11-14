package com.anrymart.webdev.controller

import com.anrymart.webdev.model.DrawingMessage
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.SendTo
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseBody
import java.util.*
import java.util.concurrent.ConcurrentHashMap

@Controller
@RequestMapping("/api/game")
class GameController {

    private val messagesByType: MutableMap<String, MutableList<DrawingMessage>> = ConcurrentHashMap<String, MutableList<DrawingMessage>>()

    @MessageMapping("/draw")
    @SendTo("/topic/drawings")
    fun drawing(message: DrawingMessage): DrawingMessage {
        messagesByType.putIfAbsent(message.type, Collections.synchronizedList(ArrayList()))
        messagesByType[message.type]!!.add(message)
        return message
    }

    @GetMapping("/messages")
    @ResponseBody
    fun getMessages(@RequestParam("types") types: List<String>): List<DrawingMessage> {
        val result: MutableList<DrawingMessage> = ArrayList<DrawingMessage>()
        for (type in types) {
            val messages: List<DrawingMessage>? = messagesByType[type]
            if (messages != null) {
                result.addAll(messagesByType[type]!!)
            }
        }
        return result
    }
}
