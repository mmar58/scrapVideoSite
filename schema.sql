-- Adminer 5.3.0 MySQL 8.4.3 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `links_progress`;
CREATE TABLE `links_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `link` longtext NOT NULL,
  `hasImage` tinyint NOT NULL DEFAULT '0',
  `completed` tinyint NOT NULL DEFAULT '0',
  `lastCompleted` datetime NULL,
  `lastMediaDate` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



DROP TABLE IF EXISTS `media`;
CREATE TABLE `media` (
  `id` int NOT NULL AUTO_INCREMENT,
  `link` longtext NOT NULL,
  `type` enum('link','media','imagelink') NOT NULL,
  `linkId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `linkId` (`linkId`),
  CONSTRAINT `media_ibfk_1` FOREIGN KEY (`linkId`) REFERENCES `links_progress` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 2025-11-14 10:13:25 UTC