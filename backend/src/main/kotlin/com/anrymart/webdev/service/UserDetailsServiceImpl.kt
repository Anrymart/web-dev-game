package com.anrymart.webdev.service

import com.anrymart.webdev.repository.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import java.util.stream.Collectors

@Service
class UserDetailsServiceImpl : UserDetailsService {

    @Autowired
    lateinit var userRepository: UserRepository

    @Throws(UsernameNotFoundException::class)
    override fun loadUserByUsername(username: String): UserDetails {
        val user = userRepository.findByUsername(username).orElseThrow { UsernameNotFoundException("User '$username' not found") }

        val authorities: List<GrantedAuthority> = user.roles!!.stream()
                .map { role -> SimpleGrantedAuthority(role.name) }
                .collect(Collectors.toList<GrantedAuthority>())

        return User
                .withUsername(username)
                .password(user.password)
                .authorities(authorities)
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build()
    }
}