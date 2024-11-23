import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { apiService } from '../config/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
// import yourImage from '../../assets/images/swe.jpg' // Adjust the path and filename as needed

const SignInScreen = ({ navigation }: { navigation: any }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    password: ''
  });

  // Thay thế useEffect bằng useFocusEffect
  useFocusEffect(
    useCallback(() => {
      clearLoginInfo();
    }, [])
  );

  const clearLoginInfo = async () => {
    setName('');
    setPassword('');
    try {
      await AsyncStorage.removeItem('loginInfo');
    } catch (error) {
      console.error('Error clearing login info:', error);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setLoginError('');
      
      if (!name || !password) {
        setLoginError('Vui lòng nhập đầy đủ thông tin');
        return;
      }

      const response = await apiService.login({
        name: name,
        password: password
      });

      if (response.data.status) {
        const userData = {
          id: response.data.user.id,
          email: response.data.user.email,
          token: response.data.token,
          user: response.data.user
        };

        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('loginInfo', JSON.stringify(userData));
        
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        setLoginError('Tên đăng nhập hoặc mật khẩu không chính xác');
      }

    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        setLoginError('Tên đăng nhập hoặc mật khẩu không chính xác');
      } else {
        setLoginError('Không thể kết nối đến server');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/tải xuống (1).png')} style={styles.image} resizeMode="contain" />

      <Text style={styles.subHeader}>Đăng nhập</Text>

      {loginError ? (
        <View style={styles.errorMessageContainer}>
          <Text style={styles.errorMessageText}>{loginError}</Text>
        </View>
      ) : null}

      <View style={styles.formContainer}>
        <View>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            placeholder="Tên đăng nhập"
            placeholderTextColor="#888"
            autoCapitalize="none"
            value={name}
            onChangeText={setName}
          />
          {errors.name ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errors.name}</Text>
            </View>
          ) : null}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity 
          style={[styles.button, errors.name ? styles.buttonDisabled : null]}
          onPress={handleSignIn}
          disabled={isLoading || !!errors.name}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Đăng Nhập</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.footerText}>Đăng ký</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Forget')}>
          <Text style={styles.footerText}>Quên mật khẩu</Text>
        </TouchableOpacity>
      </View>
      {isLoading && <ActivityIndicator size="large" color="#000" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    padding: 16,
  },
  image: {
    width: 300, // Adjust the size as needed
    height: 300, // Adjust the size as needed
    alignSelf: 'center',
    
    
  },
  subHeader: {
    fontSize: 25,
    color: 'black',
    marginBottom: 30,
    textAlign: 'center',
    fontStyle: 'italic',
    
    
    
  },
  formContainer: {
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
    width:250,
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#E50914',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
  },
  footerText: {
    color: '#333',
    fontSize: 16,
  },
  footerr: {
    color: '#800606',
  },
  successMessage: {
    color: 'green',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  inputError: {
    borderColor: 'red',
  },
  errorContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: -10,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  errorMessageContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    width: '80%',
    alignSelf: 'center',
  },
  errorMessageText: {
    color: '#d32f2f',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default SignInScreen;
