package org.swee.motionlabapi;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SimulationController {

    @PostMapping("/simulate")
    public SimulationResponse simulate(@RequestBody SimulationRequest req) {
        double angleRad = Math.toRadians(req.angle());
        double vx = req.velocity() * Math.cos(angleRad);
        double vy = req.velocity() * Math.sin(angleRad);

        double k = req.dragCoefficient();
        double dt = 0.016;
        double x = 0, y = 0;
        double maxHeight = 0;
        double time = 0;

        while (y >= 0 || time == 0) {
            double speed = Math.sqrt(vx * vx + vy * vy);
            double ax = -k * speed * vx;
            double ay = -req.gravity() - k * speed * vy;

            vx += ax * dt;
            vy += ay * dt;
            x += vx * dt;
            y += vy * dt;
            time += dt;

            if (y > maxHeight) maxHeight = y;
            if (y < 0) break;
        }

        double finalVelocity = Math.sqrt(vx * vx + vy * vy);

        return new SimulationResponse(
                round(maxHeight),
                round(time),
                round(x),
                round(finalVelocity)
        );
    }

    private double round(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}