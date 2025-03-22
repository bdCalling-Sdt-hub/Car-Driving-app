import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import tw from 'twrnc';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const Header = () => {
    const navigation = useNavigation();
    return (
        <View style={tw`flex-row justify-between items-center bg-[#29adf8]  p-2`}>
            <Image source={require('../../assets/images/companylogo_srl.png')} />

            <View style={tw`flex-row items-center gap-3`}>
                <Text style={tw`text-xl font-bold text-white`}>BANINDER PAL</Text>
                {/* <TouchableOpacity  onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={tw` border border-white rounded-full h-[40px] w-[40px] flex flex-row items-center justify-center`}>
                    <Text style={tw`text-white text-2xl`}>☰</Text>
                </TouchableOpacity>  */}
                <TouchableOpacity style={tw`w-10 h-10 rounded-full bg-white bg-opacity-20 items-center justify-center`} onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                     <Ionicons name="menu" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Header;
