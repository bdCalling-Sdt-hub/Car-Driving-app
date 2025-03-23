import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { Text, View, TouchableOpacity, Image, Alert } from "react-native";
import tw from "@/assets/lib/tailwind";
import Header from "./components/Header";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Provider } from "react-redux";
import store from "./redux/store";
import { useAuthenticateUserQuery } from "./redux/features/users/UserApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const CustomSidebar = () => {
  const navigation = useNavigation();
  
  const [apikey, setApikey] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch stored API key
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      setApikey(token);
      setIsLoading(false);  // Once token is fetched, stop the loading
    };

    checkToken();
  }, []);

  // Only run the query if the apikey is available and user clicked Change Password
  const { data, error, isLoading: queryLoading, refetch } = useAuthenticateUserQuery({ apikey }, { skip: isLoading || !apikey });

  useEffect(() => {
    if (data) {
      console.log('Authenticated user data:', data);
    }
    if (error) {
      console.error('Error fetching user data:', error);
    }
  }, [data, error]);

  const handleChangePassword = () => {
    if (apikey) {
      refetch(); // Trigger the API call when the user clicks to change password
      Alert.alert("Change Password", "You can change your password here.");
    } else {
      Alert.alert("Error", "API key not found. Please login again.");
    }
  };

  if (isLoading || queryLoading) {
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
        <Image source={require('../assets/images/companylogo_srl.png')} style={{ width: 100, height: 50 }} />
        
        <View style={tw`flex-row items-center gap-3`}>
          <Text style={tw`text-xl font-bold text-white`}>BANINDER PAL</Text>
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
        <Text style={tw`text-white text-xl font-semibold border-b-2 pb-2 border-white`}>Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => navigation.navigate('AddTrip')}
        style={tw`p-4`}
      >
        <Text style={tw`text-white text-xl font-semibold border-b-2 pb-2 border-white`}>Add Trip</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleChangePassword}
        style={tw`p-4`}
      >
        <Text style={tw`text-white text-xl font-semibold border-b-2 pb-2 border-white`}>Change Password</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={tw`p-4`}
      >
        <Text style={tw`text-white text-xl font-semibold border-b-2 pb-2 border-white`}>Help & Support</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={tw`p-4`}
        onPress={() => {
          // Handle sign out logic
          console.log('Sign out logic');
        }}
      >
        <Text style={tw`text-white text-2xl font-semibold`}>Sign Out</Text>
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
