#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to import all students from file to database
"""

# Read the student file
with open('/home/ubuntu/upload/pasted_content_5.txt', 'r', encoding='utf-8') as f:
    lines = [line.strip() for line in f.readlines()]

# Parse students data
students = []
current_grade = None
current_section = None

grade_map = {
    "الصف الأول الابتدائي": "أول",
    "الصف الثاني الابتدائي": "ثاني",
    "الصف الثالث الابتدائي": "ثالث",
    "الصف الرابع الابتدائي": "رابع",
    "الصف الخامس الابتدائي": "خامس",
    "الصف السادس الابتدائي": "سادس",
}

for line in lines:
    if not line:
        continue
    
    # Check if it's a grade header
    if "الصف" in line and "الابتدائي" in line:
        for key, value in grade_map.items():
            if key in line:
                current_grade = value
                break
    
    # Check if it's a section header
    elif "فصل" in line and current_grade:
        # Extract section number
        if "فصل (1)" in line:
            current_section = 1
        elif "فصل (2)" in line:
            current_section = 2
        elif "فصل (3)" in line:
            current_section = 3
        elif "فصل (4)" in line:
            current_section = 4
    
    # Otherwise, it's a student name
    elif current_grade and current_section and not line.startswith("🔴") and not line.startswith("🟠") and not line.startswith("🟡") and not line.startswith("🟢") and not line.startswith("🔵") and not line.startswith("🟣") and not line.startswith("📍"):
        # Escape single quotes in names
        name = line.replace("'", "''")
        students.append((name, current_grade, current_section))

# Generate SQL INSERT statements (in batches of 50)
print(f"-- Total students: {len(students)}")
print("")

batch_size = 50
for i in range(0, len(students), batch_size):
    batch = students[i:i+batch_size]
    values = []
    for name, grade, section in batch:
        values.append(f"('{name}', '{grade}', {section}, 0)")
    
    sql = f"INSERT INTO students (fullName, grade, section, score) VALUES {', '.join(values)};"
    print(sql)
    print("")
