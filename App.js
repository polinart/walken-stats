
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, TouchableOpacity, TextInput, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import DraggableFlatList from 'react-native-draggable-flatlist';


const PlayerCard = ({ player, index, onEdit, onDelete, onWin, onLoss }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(player.name);
  const [wins, setWins] = useState(player.wins);
  const [totalGames, setTotalGames] = useState(player.totalGames);

  useEffect(() => {
    setName(player.name);
    setWins(player.wins);
    setTotalGames(player.totalGames);
  }, [player]);

  const handleEdit = () => {
    if (editing) {
      // Save changes
      onEdit(index, name, wins, totalGames);
    }
    setEditing(!editing);
  };

  const handleDelete = () => {
    onDelete(index);
  };

  const handleWin = () => {
    onWin(index);
  };

  const handleLoss = () => {
    onLoss(index);
  }

  const undoLastAction = (playerId) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) =>
        player.id === playerId
          ? {
              ...player,
              totalGames: player.totalGames - 1,
              wins: player.lastAction === 'win' ? player.wins - 1 : player.wins,
              lastAction: null,
            }
          : player
      )
    );
  };

  const calculateWinRate = (player) => {
    if (player.totalGames === 0) {
      return 0;
    }
    return ((player.wins / player.totalGames) * 100).toFixed(2);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{editing ? "Edit Player" : player.name}</Text>
        <TouchableOpacity onPress={handleEdit}>
          <Ionicons name={editing ? "checkmark" : "pencil"} size={24} color="black" />
        </TouchableOpacity>
      </View>
      {editing ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            onChangeText={setName}
            value={name}
            placeholder="Name"
          />
          <TextInput
            style={styles.input}
            onChangeText={setWins}
            value={wins.toString()}
            placeholder="Wins"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            onChangeText={setTotalGames}
            value={totalGames.toString()}
            placeholder="Total Games"
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash" size={24} color="black" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.infoContainer}>
          <View>
            <Text>Wins/Total Duels: {player.wins}/{player.totalGames} </Text>
            <Text style={styles.winRate}>Win Rate: {calculateWinRate(player)}%</Text>
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Win" onPress={handleWin} />
            <Button title="Loss" onPress={handleLoss} />
          </View>
        </View>
      )}
    </View>
  );
};

const PlayerStatsScreen = ({ players, handleAddPlayer, handleEditPlayer, handleDeletePlayer, handleWinPlayer, handleLossPlayer }) => {
  return (
    <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Player Stats</Text>
        <TouchableOpacity onPress={handleAddPlayer}>
          <Ionicons name="add" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.playerListScroll}>
      <View style={styles.playerList}>
        {players.map((player, index) => (
          <PlayerCard
            key={index}
            player={player}
            index={index}
            onEdit={handleEditPlayer}
            onDelete={handleDeletePlayer}
            onWin={handleWinPlayer}
            onLoss={handleLossPlayer}
          />
        ))}
      </View>
      </ScrollView>
    </View>
    </KeyboardAvoidingView>
  );
};

const WalletScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallet</Text>
      <Text style={styles.placeholderText}>Here will be wallet data</Text>
    </View>
  );
};

const Tab = createBottomTabNavigator();

const App = () => {
  const [players, setPlayers] = useState([]);
  const [totalGames, setTotalGames] = useState(0);
  const [totalWins, setTotalWins] = useState(0);

  useEffect(() => {
    // Load players from AsyncStorage
    loadPlayers();
  }, []);

  useEffect(() => {
    // Save players to AsyncStorage whenever it changes
    const calculateTotalStats = () => {
      let games = 0;
      let wins = 0;
      players.forEach((player) => {
        games += player.totalGames;
        wins += player.wins;
      });
      setTotalGames(games);
      setTotalWins(wins);
    };

    calculateTotalStats();
    savePlayers();
  }, [players]);

  const loadPlayers = async () => {
    try {
      const storedPlayers = await AsyncStorage.getItem('players');
      if (storedPlayers) {
        setPlayers(JSON.parse(storedPlayers));
      }
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const handleWin = (index) => {
    const updatedPlayers = [...prevPlayers];
      updatedPlayers[index] = { ...player, totalGames: player.totalGames + 1, wins: player.wins + 1, lastAction: 'win' };
      return updatedPlayers;
  };

  const handleLoss = (index) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) =>
        player.id === playerId ? { ...player, totalGames: player.totalGames + 1, lastAction: 'loss' } : player
      )
    );
  };

  const savePlayers = async () => {
    try {
      await AsyncStorage.setItem('players', JSON.stringify(players));
    } catch (error) {
      console.error('Error saving players:', error);
    }
  };

  const handleAddPlayer = () => {
    setPlayers((prevPlayers) => [
      ...prevPlayers,
      { name: `Player ${prevPlayers.length + 1}`, wins: 0, totalGames: 0 },
    ]);
  };

  const handleEditPlayer = (index, name, wins, totalGames) => {
    setPlayers((prevPlayers) => {
      const updatedPlayers = [...prevPlayers];
      updatedPlayers[index] = { name, wins, totalGames };
      return updatedPlayers;
    });
  };

  const handleDeletePlayer = (index) => {
    setPlayers((prevPlayers) => {
      const updatedPlayers = [...prevPlayers];
      updatedPlayers.splice(index, 1);
      return updatedPlayers;
    });
  };

  const handleWinPlayer = (index) => {
    setPlayers((prevPlayers) => {
      const updatedPlayers = [...prevPlayers];
      const player = updatedPlayers[index];
      updatedPlayers[index] = { ...player, totalGames: parseInt(player.totalGames, 10) + 1, wins: parseInt(player.wins, 10) + 1, lastAction: 'win' };
      return updatedPlayers;
    });
  };

  const handleLossPlayer = (index) => {
    setPlayers((prevPlayers) => {
      const updatedPlayers = [...prevPlayers];
      const player = updatedPlayers[index];
      updatedPlayers[index] = { ...player, totalGames: parseInt(player.totalGames, 10) + 1, lastAction: 'loss' };
      return updatedPlayers;
    });
  };

  const calculateOverallWinRate = () => {
    if (totalGames === 0) {
      return 0;
    }
    const winRate = (totalWins / totalGames) * 100;
    return winRate.toFixed(2);
  };

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Stats" options={{ tabBarIcon: () => <Ionicons name="stats-chart" size={24} color="black" /> }}>
          {(props) => (
            <PlayerStatsScreen
              {...props}
              players={players}
              handleAddPlayer={handleAddPlayer}
              handleEditPlayer={handleEditPlayer}
              handleDeletePlayer={handleDeletePlayer}
              handleWinPlayer={handleWinPlayer}
              handleLossPlayer={handleLossPlayer}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Wallet" options={{ tabBarIcon: () => <Ionicons name="wallet" size={24} color="black" /> }}>
          {WalletScreen}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  overallCard: {
    backgroundColor: '#f5f5f5',
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
  },
  overallTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  overallWinRate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  playerList: {
    flex: 1,
  },
  playerListScroll: {
    flexGrow: 1,
    paddingBottom: 16,
    marginBottom: 100,
  },
  card: {
    backgroundColor: '#F2F2F2',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  winRate: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  infoContainer: {
    marginTop: 8,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    padding: 8,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  placeholderText: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default App;
