/**
 * Logs Screen Modal
 * Displays all ad events and debug logs
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from 'react-native';
import { logger, DemoAppLogEntry } from '../utils/DemoAppLogger';

interface LogsScreenProps {
  visible: boolean;
  onClose: () => void;
}

const LogsScreen: React.FC<LogsScreenProps> = ({ visible, onClose }) => {
  const [logs, setLogs] = useState<readonly DemoAppLogEntry[]>([]);

  useEffect(() => {
    // Subscribe to log updates
    const unsubscribe = logger.subscribe((updatedLogs) => {
      setLogs(updatedLogs);
    });

    return unsubscribe;
  }, []);

  const handleClearLogs = () => {
    logger.clearLogs();
  };

  const renderLogEntry = ({ item }: { item: DemoAppLogEntry }) => (
    <View style={styles.logEntry}>
      <Text style={styles.timestamp}>{item.formattedTimestamp}</Text>
      <Text style={styles.message}>{item.message}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕ Close</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Event Logs</Text>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearLogs}>
            <Text style={styles.clearButtonText}>🗑️ Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Log Count */}
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {logs.length} {logs.length === 1 ? 'event' : 'events'}
          </Text>
        </View>

        {/* Logs List */}
        {logs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No logs yet</Text>
            <Text style={styles.emptySubtext}>
              Ad events and interactions will appear here
            </Text>
          </View>
        ) : (
          <FlatList
            data={[...logs].reverse()} // Show newest first
            renderItem={renderLogEntry}
            keyExtractor={(item, index) => `${item.timestamp.getTime()}-${index}`}
            contentContainerStyle={styles.listContent}
            inverted={false}
            showsVerticalScrollIndicator={true}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
  },
  countContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  countText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  logEntry: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  timestamp: {
    fontSize: 12,
    color: '#757575',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#212121',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
  },
});

export default LogsScreen;

