package com.ecommerce.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomerUserDetailService customerUserDetailService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomerUserDetailService customerUserDetailService
    ) {
        this.jwtService = jwtService;
        this.customerUserDetailService = customerUserDetailService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        System.out.println("========== JWT FILTER ==========");
        System.out.println("Request: " + request.getRequestURI());

        String authHeader =
                request.getHeader("Authorization");

        System.out.println("Authorization header: " + authHeader);

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            System.out.println("NO BEARER TOKEN FOUND");

            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);

        System.out.println("JWT FOUND");

        String userEmail;

        try {

            userEmail =
                    jwtService.extractUsername(jwt);

            System.out.println(
                    "Email from JWT: " + userEmail
            );

        } catch (Exception e) {

            System.out.println(
                    "JWT EXTRACTION FAILED: "
                            + e.getMessage()
            );

            filterChain.doFilter(request, response);
            return;
        }


        if (userEmail != null &&
                SecurityContextHolder
                        .getContext()
                        .getAuthentication() == null) {

            System.out.println(
                    "Loading user: " + userEmail
            );

            UserDetails userDetails =
                    customerUserDetailService
                            .loadUserByUsername(userEmail);

            System.out.println(
                    "User loaded: "
                            + userDetails.getUsername()
            );


            if (jwtService.isTokenValid(
                    jwt,
                    userDetails
            )) {

                System.out.println("JWT IS VALID");

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);

                System.out.println(
                        "AUTHENTICATION SET SUCCESSFULLY"
                );

            } else {

                System.out.println("JWT IS INVALID");
            }
        }

        System.out.println(
                "Authentication after filter: "
                        + SecurityContextHolder
                        .getContext()
                        .getAuthentication()
        );

        filterChain.doFilter(request, response);
    }
}