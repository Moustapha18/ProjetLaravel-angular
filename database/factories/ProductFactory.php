<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = $this->faker->unique()->words(3, true);
        return [
            'category_id' => Category::factory(),
            'name' => ucfirst($name),
            'slug' => Str::slug($name.'-'.$this->faker->unique()->numberBetween(1, 9999)),
            'price_cents' => $this->faker->numberBetween(500, 8000),
            'stock' => $this->faker->numberBetween(5, 50),
            'image_path' => null,
            'description' => $this->faker->sentence(),
        ];
    }
}
