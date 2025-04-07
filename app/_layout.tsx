import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { Text, View, TouchableOpacity, Image, Alert } from "react-native";
import tw from "@/assets/lib/tailwind";
import Header from "./components/Header";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Provider } from "react-redux";
import store from "./redux/store";

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { useAuthuserMutation } from "./redux/features/users/UserApi";
import { useHeaderLogoQuery } from "./redux/features/tripApis/TripApi";

const CustomSidebar = () => {
  const navigation = useNavigation();
  const [user, setUser] = React.useState(null);
  const [apikey, setApikey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { data, isLoading: headerLoading, isError: headerError } = useHeaderLogoQuery({ apikey: apikey });
  // Fetch stored API key
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      setApikey(token);
      setIsLoading(false);  // Once token is fetched, stop the loading
    };

    checkToken();
  }, [ ]);

  useEffect(() => {
    const checkuser = async () => {
        const user = await AsyncStorage.getItem('user');
        const parseduser = JSON.parse(user || '{}');
        setUser(parseduser);

    };

    checkuser();
}, [ user ]);
  

  // Only run the query if the apikey is available and user clicked Change Password
  const [authenticateUser, { isLoading: authLoading, isError, error }] = useAuthuserMutation();;

 

  const handleChangePassword = async () => {
    if (!apikey) {
      Alert.alert("No API key found", "Please log in again.");
      return;
    }

    try {
      const response = await authenticateUser({ apikey }).unwrap();  // Call mutation with apikey
      if (response?.data) {
        console.log("Authentication successful:", response);
        Alert.alert("Success", "A 6 digit Authentication Code is Sent to your email.");
        navigation.navigate("CreateNewPassword");
      } else {
        console.log("Authentication failed:", response?.error);
        Alert.alert("Error", "Failed to authenticate user");
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      Alert.alert("Error", "An error occurred while changing password.");
    }
  };


  const handleLogout = async () => {
    Alert.alert(
      "Logout Confirmation", 
      "Are you sure you want to log out?", 
      [
        {
          text: "Cancel",
          onPress: () => console.log("Logout Cancelled"),
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              // Clear the token from AsyncStorage
              await AsyncStorage.removeItem("token");
              
              // Clear any other relevant data (e.g., user data, session info)
              await AsyncStorage.removeItem("startedTrip"); // Optional: Clear any other stored data
  
              // Redirect to SignIn page
              navigation.navigate("index");
              console.log("User logged out successfully.");
            } catch (error) {
              console.error("Error during logout:", error);
              Alert.alert("Error", "An error occurred during logout. Please try again.");
            }
          }
        }
      ],
      { cancelable: false }
    );
  };



  if (isLoading || authLoading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text>Loading...</Text>
      </View>
    );
  }


  
  return (
    <View style={tw`h-full flex-1 bg-[#29adf8] p-5`}>
      {/* Header Section */}
      <View style={tw`flex-row justify-between items-center bg-[#29adf8]  p-2`}>
      <Image source={{ uri: data?.data?.companylogo }} style={tw`aspect-video h-10 `} />
        
        <View style={tw`flex-row items-center gap-3`}>
          <Text style={tw`text-xl font-bold text-white`}>{user?.DriverName || 'Driver'}</Text>
          {/* Close Drawer button */}
          <TouchableOpacity
            style={tw`w-10 h-10 rounded-full bg-white bg-opacity-20 items-center justify-center`}
            onPress={() => navigation.dispatch(DrawerActions.closeDrawer())}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sidebar Menu */}
      <TouchableOpacity
        onPress={() => navigation.navigate('HomeScreen')}
        style={tw`p-4`}
      >
        <Text style={tw`text-white text-xl font-semibold border-b-2 pb-2 border-white`}>Start Your Day</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => navigation.navigate('AddTrip')}
        style={tw`p-4`}
      >
        <Text style={tw`text-white text-xl font-semibold border-b-2 pb-2 border-white`}>Add Trip Acvity</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleChangePassword}
        style={tw`p-4`}
      >
        <Text style={tw`text-white text-xl font-semibold border-b-2 pb-2 border-white`}>Change Password</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        // onPress={() => navigation.navigate('https://simplydispatch.ca/help.php')}
        style={tw`p-4`}
      >
        <Text style={tw`text-white text-xl font-semibold border-b-2 pb-2 border-white`}>Help & Support</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={tw`p-4`}
        onPress={handleLogout}
      >
        <Text style={tw`text-white text-xl font-semibold  pb-2 `}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function RootLayout() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer
          drawerContent={(props) => <CustomSidebar {...props} />}
          screenOptions={{
            drawerStyle: {
              width: '100%', // Full-width drawer
            },
          }}
        >
          {/* Drawer Screens */}
          <Drawer.Screen name="index" options={{ drawerLabel: "Home", title: "Home", headerShown: false }} />
          <Drawer.Screen name="AddTrip" options={{ headerShown: false }} />
          <Drawer.Screen name="CreateNewPassword" options={{ headerShown: false, title: "Change Password" }} />
        </Drawer>
      </GestureHandlerRootView>
    </Provider>
  );
}