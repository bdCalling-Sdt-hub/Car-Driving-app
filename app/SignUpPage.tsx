import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRegisterUserMutation } from "./redux/features/users/UserApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";

// Type for navigation
type RootStackParamList = {
  HomeScreen: undefined;
};

const SignUpPage: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  
  const navigation = useNavigation<ReactNavigation.NativeStackNavigationProp<RootStackParamList>>();

  // Using the register mutation hook
  const [registerUser, { isLoading, isError, error, data }] = useRegisterUserMutation();
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // If token exists, navigate to HomeScreen
        navigation.navigate('HomeScreen');
      }
    };
    
    checkToken();
  }, [navigation]);

  // Form validation function
  const validateForm = (): boolean => {
    if (!name || !email || !password) {
      Alert.alert("Validation Error", "All fields are required.");
      return false;
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Validation Error", "Please enter a valid email.");
      return false;
    }

    // Password validation
    if (password.length < 6) {
      Alert.alert("Validation Error", "Password must be at least 6 characters long.");
      return false;
    }

    return true;
  };

  // const handleSignUp = async () => {
  //   const user = {
  //     name,
  //     email,
  //     password,
  //   };
  
  //   if (!validateForm()) return; // If validation fails, exit early
  
  //   try {
  //     const response = await registerUser(user).unwrap();
  //     console.log("response signup", response);
  
  //     // Handle failure response
  //     // if (response?.data?.code === 'Failure') {
  //     //   Alert.alert("Error", response?.data?.message || "Something went wrong.");
  //     //   return;
  //     // }
  
  //     // Handle success response
  //     if (response?.data?.code === 'success') {
  //       Alert.alert("Success", response?.data?.message || "Account created successfully!");
  //       navigation.navigate("SignInPage");
  //     } elseif (response?.data?.code === 'Failure'){
  //       Alert.alert("Error", response?.data?.message || "Something went wrong.");
  //     } else {
  //       Alert.alert("Error", "Failed to create account.");
  //     }
  //   } catch (error) {
  //     console.error("Error during registration", error);
  //     Alert.alert("Error", "An error occurred during registration.");
  //   }
  // };
  const handleSignUp = async () => {
    const user = {
      name,
      email,
      password,
    };
  
    if (!validateForm()) return;
  
    try {
      const response = await registerUser(user).unwrap();
      console.log("response signup", response);
  
      const statusCode = response?.data?.code;
      const message = response?.data?.message || "Something went wrong.";
  
      if (statusCode === 'Success') {
        Alert.alert("Success", message);
        setEmail('');
        setPassword('');
        setName('');
        // navigation.navigate("SignInPage");
        return;
      }
  
      if (statusCode === 'Failure') {
        Alert.alert("Error", message);
        return;
      }
  
      Alert.alert("Error", "Failed to create account.");
    } catch (error) {
      console.error("Error during registration", error);
      Alert.alert("Error", "An error occurred during registration.");
    }
  };
  
  return (
    <View style={tw`bg-white h-full  `}>
       <Stack.Screen name="SignUpPage" options={{ headerShown: false }} />
      <Text style={tw`text-2xl font-semibold`}>Create Account</Text>
      <Text style={tw`text-gray-500 text-sm font-medium mt-2 mb-6`}>
        Let's get started by filling out the form below.
      </Text>

      {/* Name Input */}
      <TextInput
        style={tw`border border-gray-300 rounded-lg h-[44px] px-2 mb-4 text-[16px] font-bold text-gray-600`}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      {/* Email Input */}
      <TextInput
        style={tw`border border-gray-300 rounded-lg h-[44px] px-2 mb-4 text-[16px] font-bold text-gray-600`}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {/* Password Input */}
      <View style={tw`flex-row items-center border border-gray-300 rounded-lg  mb-4`}>
        <TextInput
          style={tw`flex-1 text-[16px] h-[44px]  px-2 font-bold text-gray-600`}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible}
        />
        <TouchableOpacity style={tw` px-2`} onPress={() => setPasswordVisible(!passwordVisible)}>
          <Ionicons name={passwordVisible ? "eye" : "eye-off"} size={24} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity
        onPress={handleSignUp}
        style={tw`bg-[#29adf8] w-[70%] mt-6 mx-auto py-3 shadow-lg rounded-lg items-center`}
      >
        <Text style={tw`text-white text-lg font-bold`}>
          {isLoading ? "Signing up..." : "Get Started"}
        </Text>
      </TouchableOpacity>

      {/* Other Sign Up Options */}
      {/* <Text style={tw`text-center text-gray-500 text-lg mt-4 mb-4`}>Or sign up with</Text>

      <View>
        <TouchableOpacity style={tw`flex-row items-center border border-gray-300 p-3 w-[75%] mx-auto rounded-lg mb-3`}>
          <Ionicons name="logo-google" size={25} color="black" />
          <Text style={tw`ml-2 text-lg font-bold`}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={tw`flex-row items-center border border-gray-300 p-3 w-[75%] mx-auto rounded-lg`}>
          <Ionicons name="logo-apple" size={25} color="black" />
          <Text style={tw`ml-2 text-lg font-bold`}>Continue with Apple</Text>
        </TouchableOpacity>
      </View> */}

      {/* <View style={tw`w-[70%] mx-auto mt-4`}>
        <Image source={require("@/assets/images/dispatch.png")} />
      </View> */}
    </View>
  );
};

export default SignUpPage;
