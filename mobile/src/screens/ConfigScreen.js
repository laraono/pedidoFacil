import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { appConfig, saveAppConfig } from '../services/apiConfig';

export default function ConfigScreen({ onFinishConfig }) {
  const [ipAddress, setIpAddress] = useState(appConfig.BASE_IP);
  const [selfServiceCode, setSelfServiceCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!ipAddress || !selfServiceCode) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (!ipAddress.startsWith('http://') && !ipAddress.startsWith('https://')) {
      Alert.alert('Erro', 'O IP/URL deve começar com http:// ou https://');
      return;
    }

    setIsSaving(true);
    try {
      const cleanIp = ipAddress.replace(/\/$/, '');
      
      const response = await fetch(`${cleanIp}/api/v1/estabelecimento/code/${selfServiceCode}`);
      
      if (!response.ok) {
        throw new Error('Código do estabelecimento inválido ou não encontrado.');
      }

      const data = await response.json();
      
      const fetchedEstablishmentId = data.id; 

      if (!fetchedEstablishmentId) {
        throw new Error('O servidor não retornou um ID válido.');
      }

      await saveAppConfig(cleanIp, fetchedEstablishmentId, selfServiceCode);  
          
      Alert.alert('Sucesso!', `Conectado ao estabelecimento: ${data.name || 'ID ' + fetchedEstablishmentId}`);
      onFinishConfig(); 

    } catch (error) {
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique o IP e a porta.');
      } else {
        Alert.alert('Erro', error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <Text style={styles.title}>PedidoFácil</Text>
        <Text style={styles.subtitle}>Configuração do Totem</Text>

        <Text style={styles.label}>URL do Servidor (com porta)</Text>
        <TextInput
          style={styles.input}
          value={ipAddress}
          onChangeText={setIpAddress}
          placeholder="ex: http://192.168.1.100:3000"
          autoCapitalize="none"
          keyboardType="url"
        />

        <Text style={styles.label}>Código do Autoatendimento</Text>
        <TextInput
          style={styles.input}
          value={selfServiceCode}
          onChangeText={setSelfServiceCode}
          placeholder="ex: TOTEM-01"
          autoCapitalize="characters"
        />

        <TouchableOpacity 
          style={[styles.button, isSaving && styles.buttonDisabled]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.buttonText}>
            {isSaving ? 'Buscando Estabelecimento...' : 'Conectar e Iniciar'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#111827',
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});