CREATE DATABASE IF NOT EXISTS myacademy
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE myacademy;

CREATE TABLE IF NOT EXISTS roles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_code VARCHAR(30) NOT NULL,
  role_name VARCHAR(60) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_role_code (role_code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS permissions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  permission_code VARCHAR(60) NOT NULL,
  permission_name VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_permissions_permission_code (permission_code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_role_permissions_role
    FOREIGN KEY (role_id) REFERENCES roles (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_role_permissions_permission
    FOREIGN KEY (permission_id) REFERENCES permissions (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_id BIGINT UNSIGNED NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  display_name VARCHAR(60) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY ix_users_role_active (role_id, is_active),
  CONSTRAINT fk_users_role
    FOREIGN KEY (role_id) REFERENCES roles (id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS classes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  class_name VARCHAR(80) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_classes_name_year (class_name, academic_year)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS teacher_classes (
  teacher_id BIGINT UNSIGNED NOT NULL,
  class_id BIGINT UNSIGNED NOT NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (teacher_id, class_id),
  CONSTRAINT fk_teacher_classes_teacher
    FOREIGN KEY (teacher_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_teacher_classes_class
    FOREIGN KEY (class_id) REFERENCES classes (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS student_enrollments (
  student_id BIGINT UNSIGNED NOT NULL,
  class_id BIGINT UNSIGNED NOT NULL,
  enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP NULL,
  PRIMARY KEY (student_id, class_id),
  KEY ix_student_enrollments_class (class_id, ended_at),
  CONSTRAINT fk_student_enrollments_student
    FOREIGN KEY (student_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_student_enrollments_class
    FOREIGN KEY (class_id) REFERENCES classes (id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS attendance_records (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_id BIGINT UNSIGNED NOT NULL,
  class_id BIGINT UNSIGNED NOT NULL,
  attendance_date DATE NOT NULL,
  status ENUM(
    'pending',
    'present',
    'absent',
    'sick',
    'permit',
    'on_duty',
    'rejected'
  ) NOT NULL DEFAULT 'pending',
  checked_in_at DATETIME NULL,
  submitted_by BIGINT UNSIGNED NULL,
  reviewed_by BIGINT UNSIGNED NULL,
  reviewed_at DATETIME NULL,
  review_note VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_attendance_student_date (student_id, attendance_date),
  KEY ix_attendance_class_date_status (class_id, attendance_date, status),
  KEY ix_attendance_reviewer (reviewed_by, reviewed_at),
  CONSTRAINT fk_attendance_student
    FOREIGN KEY (student_id) REFERENCES users (id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_attendance_class
    FOREIGN KEY (class_id) REFERENCES classes (id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_attendance_student_class
    FOREIGN KEY (student_id, class_id)
    REFERENCES student_enrollments (student_id, class_id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_attendance_submitter
    FOREIGN KEY (submitted_by) REFERENCES users (id)
    ON DELETE SET NULL,
  CONSTRAINT fk_attendance_reviewer
    FOREIGN KEY (reviewed_by) REFERENCES users (id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT IGNORE INTO roles (role_code, role_name) VALUES
  ('admin', 'Administrator'),
  ('teacher', 'Guru'),
  ('student', 'Murid');

INSERT IGNORE INTO permissions (permission_code, permission_name) VALUES
  ('users.manage', 'Mengatur seluruh akun dan role'),
  ('roles.manage', 'Mengatur role dan hak akses'),
  ('classes.manage', 'Mengatur kelas dan penugasan guru'),
  ('users.update_student_name', 'Mengubah nama murid dalam kelas yang diajar'),
  ('attendance.read_class', 'Melihat kehadiran kelas yang diajar'),
  ('attendance.review_class', 'Menyetujui atau mengubah kehadiran kelas yang diajar'),
  ('attendance.check_in_self', 'Mengirim check-in kehadiran sendiri'),
  ('attendance.read_self', 'Melihat kehadiran sendiri');

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles AS r
CROSS JOIN permissions AS p
WHERE r.role_code = 'admin';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles AS r
JOIN permissions AS p
  ON p.permission_code IN (
    'users.update_student_name',
    'attendance.read_class',
    'attendance.review_class'
  )
WHERE r.role_code = 'teacher';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles AS r
JOIN permissions AS p
  ON p.permission_code IN (
    'attendance.check_in_self',
    'attendance.read_self'
  )
WHERE r.role_code = 'student';
