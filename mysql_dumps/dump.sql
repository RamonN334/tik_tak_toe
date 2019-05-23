CREATE DATABASE  IF NOT EXISTS `ttt_db` /*!40100 DEFAULT CHARACTER SET latin1 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `ttt_db`;
-- MySQL dump 10.13  Distrib 8.0.16, for Win64 (x86_64)
--
-- Host: localhost    Database: ttt_db
-- ------------------------------------------------------
-- Server version	8.0.16

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `gameSessions`
--

DROP TABLE IF EXISTS `gameSessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `gameSessions` (
  `accessToken` varchar(36) NOT NULL,
  `userName` varchar(100) NOT NULL,
  `gameToken` varchar(36) DEFAULT NULL,
  `yourTurn` tinyint(4) NOT NULL DEFAULT '0',
  `yourSign` varchar(1) NOT NULL DEFAULT 'X',
  `gameRole` varchar(20) NOT NULL DEFAULT 'Player',
  PRIMARY KEY (`accessToken`),
  UNIQUE KEY `accessToken_UNIQUE` (`accessToken`),
  KEY `gameToken` (`gameToken`),
  CONSTRAINT `gameToken` FOREIGN KEY (`gameToken`) REFERENCES `games` (`gameToken`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gameSessions`
--

LOCK TABLES `gameSessions` WRITE;
/*!40000 ALTER TABLE `gameSessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `gameSessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `games`
--

DROP TABLE IF EXISTS `games`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `games` (
  `gameToken` varchar(36) NOT NULL,
  `owner` varchar(100) NOT NULL,
  `opponent` varchar(100) DEFAULT NULL,
  `gameStart` datetime(1) NOT NULL,
  `lastUpdate` datetime(1) NOT NULL,
  `gameResult` varchar(10) DEFAULT NULL,
  `state` varchar(10) NOT NULL,
  `winner` varchar(100) DEFAULT NULL,
  `size` int(10) unsigned NOT NULL,
  `field` varchar(200) NOT NULL,
  PRIMARY KEY (`gameToken`),
  UNIQUE KEY `gameToken_UNIQUE` (`gameToken`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `games`
--

LOCK TABLES `games` WRITE;
/*!40000 ALTER TABLE `games` DISABLE KEYS */;
/*!40000 ALTER TABLE `games` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-05-23  8:33:34
