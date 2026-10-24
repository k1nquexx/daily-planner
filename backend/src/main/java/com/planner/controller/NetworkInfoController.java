package com.planner.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.nio.file.Files;
import java.util.*;

@RestController
@RequestMapping("/api/network-info")
public class NetworkInfoController {

    @Value("${server.port:8080}")
    private int serverPort;

    @GetMapping
    public ResponseEntity<?> getNetworkInfo() {
        List<String> addresses = new ArrayList<>();
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface iface = interfaces.nextElement();
                if (iface.isLoopback() || !iface.isUp()) continue;

                Enumeration<InetAddress> inetAddresses = iface.getInetAddresses();
                while (inetAddresses.hasMoreElements()) {
                    InetAddress addr = inetAddresses.nextElement();
                    if (!addr.isLoopbackAddress() && addr.getHostAddress().matches("\\d+\\.\\d+\\.\\d+\\.\\d+")) {
                        addresses.add("http://" + addr.getHostAddress() + ":" + serverPort);
                    }
                }
            }
        } catch (Exception ignored) {}

        if (addresses.isEmpty()) {
            addresses.add("http://localhost:" + serverPort);
        }

        String tunnelUrl = null;
        try {
            File[] candidates = new File[] {
                    new File("tunnel_url.txt"),
                    new File("../../tunnel_url.txt"),
                    new File("../tunnel_url.txt")
            };
            for (File f : candidates) {
                if (f.exists() && f.isFile()) {
                    String content = Files.readString(f.toPath()).trim();
                    if (content.startsWith("https://")) {
                        tunnelUrl = content;
                        break;
                    }
                }
            }
        } catch (Exception ignored) {}

        Map<String, Object> res = new HashMap<>();
        res.put("port", serverPort);
        res.put("preferredUrl", addresses.get(0));
        res.put("allUrls", addresses);
        res.put("tunnelUrl", tunnelUrl);

        return ResponseEntity.ok(res);
    }
}
