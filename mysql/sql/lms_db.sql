-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 17, 2025 at 06:29 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lms_db`
--
CREATE DATABASE IF NOT EXISTS `lms_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `lms_db`;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_assignments`
--

CREATE TABLE `tbl_assignments` (
  `homeworkId` int(11) NOT NULL,
  `courseId` int(11) NOT NULL,
  `deadline` datetime DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `filetype` varchar(255) DEFAULT NULL,
  `attempt` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_assignment_notifications`
--

CREATE TABLE `tbl_assignment_notifications` (
  `id` int(11) NOT NULL,
  `homeworkId` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `seen` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_courses`
--

CREATE TABLE `tbl_courses` (
  `courseId` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `teacherId` int(11) NOT NULL,
  `majorId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_courses`
--

INSERT INTO `tbl_courses` (`courseId`, `name`, `teacherId`, `majorId`) VALUES
(1, 'Introduction to Programming (Python)', 1, 1),
(2, 'Introduction to Machine Learning', 2, 2),
(3, 'Data Structures and Algorithms', 4, 1),
(4, 'Web Application Programming', 3, 1),
(5, 'Sculpture and Form', 2, 2);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_enrollments`
--

CREATE TABLE `tbl_enrollments` (
  `enrollmentId` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `courseId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_enrollments`
--

INSERT INTO `tbl_enrollments` (`enrollmentId`, `studentId`, `courseId`) VALUES
(1, 1, 1),
(2, 1, 3),
(3, 1, 4),
(4, 2, 1),
(5, 2, 3),
(6, 2, 4),
(7, 3, 1),
(8, 3, 3),
(9, 3, 4),
(10, 5, 1),
(11, 5, 3),
(12, 5, 4),
(13, 8, 1),
(14, 8, 3),
(15, 8, 4),
(16, 4, 2),
(17, 4, 5),
(18, 6, 2),
(19, 6, 5),
(20, 7, 2),
(21, 7, 5),
(22, 8, 2),
(23, 8, 5);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_faculty`
--

CREATE TABLE `tbl_faculty` (
  `facultyId` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_faculty`
--

INSERT INTO `tbl_faculty` (`facultyId`, `name`) VALUES
(1, 'Faculty of Information Technology');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_faculty_head`
--

CREATE TABLE `tbl_faculty_head` (
  `id` int(11) NOT NULL,
  `facultyId` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_faculty_head`
--

INSERT INTO `tbl_faculty_head` (`id`, `facultyId`, `name`, `email`, `password`) VALUES
(1, 1, 'Information Techonology Faculty Head', 'IT.Head@university.edu', '$argon2d$v=19$m=12,t=3,p=1$aWNxc2JvNXZrNDkwMDAwMA$XDolCabdfl64LIpZIAW0DQ');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_majors`
--

CREATE TABLE `tbl_majors` (
  `majorId` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `facultyId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_majors`
--

INSERT INTO `tbl_majors` (`majorId`, `name`, `facultyId`) VALUES
(1, 'Software Engineering', 1),
(2, 'Computer Science', 1);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_materials`
--

CREATE TABLE `tbl_materials` (
  `materialId` int(11) NOT NULL,
  `courseId` int(11) NOT NULL,
  `path` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_material_completions`
--

CREATE TABLE `tbl_material_completions` (
  `studentId` int(11) NOT NULL,
  `materialId` int(11) NOT NULL,
  `completed` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_material_notifications`
--

CREATE TABLE `tbl_material_notifications` (
  `id` int(11) NOT NULL,
  `materialId` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `seen` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_students`
--

CREATE TABLE `tbl_students` (
  `studentId` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `majorId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_students`
--

INSERT INTO `tbl_students` (`studentId`, `name`, `email`, `password`, `majorId`) VALUES
(1, 'Saw Baw Mu Thaw', 'thawthibaw@gmail.com', '$argon2d$v=19$m=12,t=3,p=1$YWh1cDkwaTcwNDYwMDAwMA$AtGYhmUKBE/s2KplKJ3FzA', 1),
(2, 'Saw Harry', 'vestarex20@gmail.com', '$argon2d$v=19$m=12,t=3,p=1$azBwYTNicHIxeGMwMDAwMA$rwOK20XhUXvEAYVHme0Imw', 1),
(3, 'Alice Johnson', 'alice.j@university.edu', '$argon2d$v=19$m=12,t=3,p=1$aWNxc2JvNXZrNDkwMDAwMA$XDolCabdfl64LIpZIAW0DQ', 1),
(4, 'Bob Smith', 'bob.s@university.edu', '$argon2d$v=19$m=12,t=3,p=1$aWNxc2JvNXZrNDkwMDAwMA$XDolCabdfl64LIpZIAW0DQ', 2),
(5, 'Charlie Brown', 'charlie.b@university.edu', '$argon2d$v=19$m=12,t=3,p=1$aWNxc2JvNXZrNDkwMDAwMA$XDolCabdfl64LIpZIAW0DQ', 1),
(6, 'Diana Prince', 'diana.p@university.edu', '$argon2d$v=19$m=12,t=3,p=1$aWNxc2JvNXZrNDkwMDAwMA$XDolCabdfl64LIpZIAW0DQ', 2),
(7, 'Ethan Hunt', 'ethan.h@university.edu', '$argon2d$v=19$m=12,t=3,p=1$aWNxc2JvNXZrNDkwMDAwMA$XDolCabdfl64LIpZIAW0DQ', 2),
(8, 'Fiona Glenn', 'fiona.g@university.edu', '$argon2d$v=19$m=12,t=3,p=1$aWNxc2JvNXZrNDkwMDAwMA$XDolCabdfl64LIpZIAW0DQ', 1),
(9, 'George Carlin', 'george.c@university.edu', '$argon2d$v=19$m=12,t=3,p=1$aWNxc2JvNXZrNDkwMDAwMA$XDolCabdfl64LIpZIAW0DQ', 2);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_submissions`
--

CREATE TABLE `tbl_submissions` (
  `submissionId` int(11) NOT NULL,
  `studentId` int(11) DEFAULT NULL,
  `homeworkId` int(11) DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `attempts` int(11) DEFAULT NULL,
  `score` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_teachers`
--

CREATE TABLE `tbl_teachers` (
  `teacherId` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `facultyId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_teachers`
--

INSERT INTO `tbl_teachers` (`teacherId`, `name`, `email`, `password`, `facultyId`) VALUES
(1, 'Dr. Alan Turing', 'alan.t@university.edu', '$argon2d$v=19$m=12,t=3,p=1$aWNxc2JvNXZrNDkwMDAwMA$XDolCabdfl64LIpZIAW0DQ', 1),
(2, 'Prof. Georgia OKeeffe', 'georgia.o@university.edu', '$argon2d$v=19$m=12,t=3,p=1$aWNxc2JvNXZrNDkwMDAwMA$XDolCabdfl64LIpZIAW0DQ', 1),
(3, 'Ms. Betty Friedan', 'betty.f@university.edu', '$argon2d$v=19$m=12,t=3,p=1$aWNxc2JvNXZrNDkwMDAwMA$XDolCabdfl64LIpZIAW0DQ', 1),
(4, 'Dr. Grace Hopper', 'grace.h@university.edu', '$argon2d$v=19$m=12,t=3,p=1$aWNxc2JvNXZrNDkwMDAwMA$XDolCabdfl64LIpZIAW0DQ', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_assignments`
--
ALTER TABLE `tbl_assignments`
  ADD PRIMARY KEY (`homeworkId`),
  ADD KEY `courseId` (`courseId`);

--
-- Indexes for table `tbl_assignment_notifications`
--
ALTER TABLE `tbl_assignment_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `homeworkId` (`homeworkId`);

--
-- Indexes for table `tbl_courses`
--
ALTER TABLE `tbl_courses`
  ADD PRIMARY KEY (`courseId`),
  ADD KEY `majorId` (`majorId`),
  ADD KEY `teacherId` (`teacherId`);

--
-- Indexes for table `tbl_enrollments`
--
ALTER TABLE `tbl_enrollments`
  ADD PRIMARY KEY (`enrollmentId`),
  ADD KEY `studentId` (`studentId`),
  ADD KEY `courseId` (`courseId`);

--
-- Indexes for table `tbl_faculty`
--
ALTER TABLE `tbl_faculty`
  ADD PRIMARY KEY (`facultyId`);

--
-- Indexes for table `tbl_faculty_head`
--
ALTER TABLE `tbl_faculty_head`
  ADD PRIMARY KEY (`id`),
  ADD KEY `facultyId` (`facultyId`);

--
-- Indexes for table `tbl_majors`
--
ALTER TABLE `tbl_majors`
  ADD PRIMARY KEY (`majorId`),
  ADD KEY `facultyId` (`facultyId`);

--
-- Indexes for table `tbl_materials`
--
ALTER TABLE `tbl_materials`
  ADD PRIMARY KEY (`materialId`),
  ADD KEY `courseId` (`courseId`);

--
-- Indexes for table `tbl_material_completions`
--
ALTER TABLE `tbl_material_completions`
  ADD PRIMARY KEY (`studentId`,`materialId`),
  ADD KEY `materialId` (`materialId`);

--
-- Indexes for table `tbl_material_notifications`
--
ALTER TABLE `tbl_material_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `materialId` (`materialId`);

--
-- Indexes for table `tbl_students`
--
ALTER TABLE `tbl_students`
  ADD PRIMARY KEY (`studentId`),
  ADD KEY `majorId` (`majorId`);

--
-- Indexes for table `tbl_submissions`
--
ALTER TABLE `tbl_submissions`
  ADD PRIMARY KEY (`submissionId`),
  ADD KEY `studentId` (`studentId`),
  ADD KEY `homeworkId` (`homeworkId`);

--
-- Indexes for table `tbl_teachers`
--
ALTER TABLE `tbl_teachers`
  ADD PRIMARY KEY (`teacherId`),
  ADD KEY `facultyId` (`facultyId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_assignments`
--
ALTER TABLE `tbl_assignments`
  MODIFY `homeworkId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_assignment_notifications`
--
ALTER TABLE `tbl_assignment_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_courses`
--
ALTER TABLE `tbl_courses`
  MODIFY `courseId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tbl_enrollments`
--
ALTER TABLE `tbl_enrollments`
  MODIFY `enrollmentId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `tbl_faculty`
--
ALTER TABLE `tbl_faculty`
  MODIFY `facultyId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_faculty_head`
--
ALTER TABLE `tbl_faculty_head`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_majors`
--
ALTER TABLE `tbl_majors`
  MODIFY `majorId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tbl_materials`
--
ALTER TABLE `tbl_materials`
  MODIFY `materialId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_material_notifications`
--
ALTER TABLE `tbl_material_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_students`
--
ALTER TABLE `tbl_students`
  MODIFY `studentId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `tbl_submissions`
--
ALTER TABLE `tbl_submissions`
  MODIFY `submissionId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_teachers`
--
ALTER TABLE `tbl_teachers`
  MODIFY `teacherId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tbl_assignments`
--
ALTER TABLE `tbl_assignments`
  ADD CONSTRAINT `tbl_assignments_ibfk_1` FOREIGN KEY (`courseId`) REFERENCES `tbl_courses` (`courseId`);

--
-- Constraints for table `tbl_assignment_notifications`
--
ALTER TABLE `tbl_assignment_notifications`
  ADD CONSTRAINT `tbl_assignment_notifications_ibfk_1` FOREIGN KEY (`homeworkId`) REFERENCES `tbl_assignments` (`homeworkId`);

--
-- Constraints for table `tbl_courses`
--
ALTER TABLE `tbl_courses`
  ADD CONSTRAINT `tbl_courses_ibfk_1` FOREIGN KEY (`majorId`) REFERENCES `tbl_majors` (`majorId`),
  ADD CONSTRAINT `tbl_courses_ibfk_2` FOREIGN KEY (`teacherId`) REFERENCES `tbl_teachers` (`teacherId`);

--
-- Constraints for table `tbl_enrollments`
--
ALTER TABLE `tbl_enrollments`
  ADD CONSTRAINT `tbl_enrollments_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `tbl_students` (`studentId`),
  ADD CONSTRAINT `tbl_enrollments_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `tbl_courses` (`courseId`);

--
-- Constraints for table `tbl_faculty_head`
--
ALTER TABLE `tbl_faculty_head`
  ADD CONSTRAINT `tbl_faculty_head_ibfk_1` FOREIGN KEY (`facultyId`) REFERENCES `tbl_faculty` (`facultyId`);

--
-- Constraints for table `tbl_majors`
--
ALTER TABLE `tbl_majors`
  ADD CONSTRAINT `tbl_majors_ibfk_1` FOREIGN KEY (`facultyId`) REFERENCES `tbl_faculty` (`facultyId`);

--
-- Constraints for table `tbl_materials`
--
ALTER TABLE `tbl_materials`
  ADD CONSTRAINT `tbl_materials_ibfk_1` FOREIGN KEY (`courseId`) REFERENCES `tbl_courses` (`courseId`);

--
-- Constraints for table `tbl_material_completions`
--
ALTER TABLE `tbl_material_completions`
  ADD CONSTRAINT `tbl_material_completions_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `tbl_students` (`studentId`),
  ADD CONSTRAINT `tbl_material_completions_ibfk_2` FOREIGN KEY (`materialId`) REFERENCES `tbl_materials` (`materialId`);

--
-- Constraints for table `tbl_material_notifications`
--
ALTER TABLE `tbl_material_notifications`
  ADD CONSTRAINT `tbl_material_notifications_ibfk_1` FOREIGN KEY (`materialId`) REFERENCES `tbl_materials` (`materialId`);

--
-- Constraints for table `tbl_students`
--
ALTER TABLE `tbl_students`
  ADD CONSTRAINT `tbl_students_ibfk_1` FOREIGN KEY (`majorId`) REFERENCES `tbl_majors` (`majorId`);

--
-- Constraints for table `tbl_submissions`
--
ALTER TABLE `tbl_submissions`
  ADD CONSTRAINT `tbl_submissions_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `tbl_students` (`studentId`),
  ADD CONSTRAINT `tbl_submissions_ibfk_2` FOREIGN KEY (`homeworkId`) REFERENCES `tbl_assignments` (`homeworkId`);

--
-- Constraints for table `tbl_teachers`
--
ALTER TABLE `tbl_teachers`
  ADD CONSTRAINT `tbl_teachers_ibfk_1` FOREIGN KEY (`facultyId`) REFERENCES `tbl_faculty` (`facultyId`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
