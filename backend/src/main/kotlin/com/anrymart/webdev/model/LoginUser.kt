package com.anrymart.webdev.model

import com.fasterxml.jackson.annotation.JsonProperty

class LoginUser {

    @JsonProperty("username")
    var username: String? = null

    @JsonProperty("password")
    var password: String? = null

    @JsonProperty("recapctha_token")
    var recaptchaToken: String? = null

    constructor() {}

    constructor(username: String, password: String, recaptchaToken: String) {
        this.username = username
        this.password = password
        this.recaptchaToken = recaptchaToken
    }
}