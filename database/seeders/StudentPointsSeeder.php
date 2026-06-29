<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StudentPointsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $records = [];

        foreach (range(1, 30) as $studentId) {
            $records[] = [
                'student_id' => $studentId,
                'points' => random_int(5, 25),
                'reason' => 'مشاركة صفية',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        DB::table('student_points')->insert($records);
    }
}
