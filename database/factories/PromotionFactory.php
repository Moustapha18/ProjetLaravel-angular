<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PromotionFactory extends Factory
{
    public function definition(): array
    {
        $percent = $this->faker->boolean(60);
        return [
            'type'  => $percent ? 'PERCENT' : 'FIXED',
            'value' => $percent ? $this->faker->numberBetween(5, 30) : $this->faker->randomFloat(2, 0.2, 2.0), // en unités monétaires
            'scope' => 'CATEGORY', // on mettra scope_id plus tard
            'scope_id' => null,
            'starts_at' => now()->subDays($this->faker->numberBetween(0, 10)),
            'ends_at'   => now()->addDays($this->faker->numberBetween(5, 20)),
            'is_active' => true,
        ];
    }
}
