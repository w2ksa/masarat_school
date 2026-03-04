-- حذف الجدول القديم
DROP TABLE IF EXISTS teacher_votes;

-- إنشاء الجدول الجديد
CREATE TABLE teacher_votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacherNameId INT NOT NULL,
  votingPeriodId INT NOT NULL,
  studentId INT NOT NULL,
  voteRank INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (teacherNameId) REFERENCES teacher_names(id) ON DELETE CASCADE,
  FOREIGN KEY (votingPeriodId) REFERENCES voting_periods(id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);
