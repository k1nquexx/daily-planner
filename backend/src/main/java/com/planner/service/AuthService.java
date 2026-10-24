package com.planner.service;

import com.planner.config.JwtTokenProvider;
import com.planner.dto.AuthRequest;
import com.planner.dto.AuthResponse;
import com.planner.model.UserAccount;
import com.planner.repository.UserAccountRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserAccountRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Value("${planner.default-pin:1234}")
    private String defaultPin;

    public AuthService(UserAccountRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @PostConstruct
    public void initDefaultAccount() {
        if (userRepository.count() == 0) {
            UserAccount account = new UserAccount("owner", passwordEncoder.encode(defaultPin));
            userRepository.save(account);
        }
    }

    public AuthResponse authenticate(AuthRequest request) {
        if (request == null || request.getPin() == null || request.getPin().trim().isEmpty()) {
            throw new IllegalArgumentException("PIN код не может быть пустым");
        }

        UserAccount user = userRepository.findByUsername("owner")
                .orElseGet(() -> userRepository.save(new UserAccount("owner", passwordEncoder.encode(defaultPin))));

        if (!passwordEncoder.matches(request.getPin().trim(), user.getPinHash())) {
            throw new IllegalArgumentException("Неверный PIN-код");
        }

        String token = tokenProvider.createToken(user.getUsername());
        boolean isDefault = passwordEncoder.matches(defaultPin, user.getPinHash());
        return new AuthResponse(token, user.getUsername(), isDefault);
    }

    public void updatePin(String currentPin, String newPin) {
        UserAccount user = userRepository.findByUsername("owner")
                .orElseThrow(() -> new IllegalStateException("Пользователь не найден"));

        if (!passwordEncoder.matches(currentPin, user.getPinHash())) {
            throw new IllegalArgumentException("Текущий PIN-код указан неверно");
        }

        if (newPin == null || newPin.trim().length() < 4) {
            throw new IllegalArgumentException("Новый PIN-код должен содержать минимум 4 символа");
        }

        user.setPinHash(passwordEncoder.encode(newPin.trim()));
        userRepository.save(user);
    }
}
