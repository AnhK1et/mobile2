import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { apiService } from '../config/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChangePassword = ({ navigation }: { navigation: any }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const checkPassword = (text: string) => {
    setRequirements({
      length: text.length >= 6,
      uppercase: /[A-Z]/.test(text),
      lowercase: /[a-z]/.test(text),
      number: /[0-9]/.test(text),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(text)
    });
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    try {
      const userInfo = await AsyncStorage.getItem('loginInfo');
      if (userInfo) {
        const userData = JSON.parse(userInfo);
        setUserId(userData.id);
      }
    } catch (error) {
      console.error('Error getting user info:', error);
    }
  };

  const handleChangePassword = async () => {
    try {
      setShowError(false);
      setShowSuccess(false);

      if (!oldPassword) {
        setShowError(true);
        return;
      }

      if (!Object.values(requirements).every(req => req)) {
        setShowError(true);
        return;
      }

      if (oldPassword === password) {
        setShowError(true);
        return;
      }

      setLoading(true);

      const response = await apiService.changePassword(userId, {
        oldPassword,
        password
      });

      if (response.data.status) {
        setShowSuccess(true);
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        setShowError(true);
      }
    } catch (error: any) {
      console.error('Lỗi đổi mật khẩu:', error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>cellphone<Text style={styles.logoS}>S</Text></Text>
      </View>

      <Text style={styles.title}>Đăng nhập</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Tên đăng nhập"
          placeholderTextColor="#999"
          value={oldPassword}
          onChangeText={setOldPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            checkPassword(text);
          }}
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleChangePassword}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            Đăng Nhập
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomLinks}>
          <TouchableOpacity>
            <Text style={styles.link}>Đăng ký</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.link}>Quên mật khẩu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  logoS: {
    color: '#D70018',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  loginButton: {
    backgroundColor: '#D70018',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  link: {
    color: '#333',
    fontSize: 14,
  },
});

export default ChangePassword;
