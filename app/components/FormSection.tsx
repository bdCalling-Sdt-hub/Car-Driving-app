import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import tw from "twrnc";
import DatePicker from 'react-native-date-picker';

interface FormData {
  activity: string;
  location: string;
  truck: string;
  trailer: string;
  odometer: string;
}

interface FormSectionProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  activityList: { item: string }[];
  trucklistandtailorlist: {
    trucklist: { item: string }[];
    trailerlist: { item: string }[];
  };
  setcurrentTime: React.Dispatch<React.SetStateAction<string>>;
}

const FormSection: React.FC<FormSectionProps> = ({
  formData,
  setFormData,
  activityList,
  setcurrentTime,
  trucklistandtailorlist = [],
}) => {

  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  
  return (
    <View style={tw`p-4`}>
      <View>
        <View style={tw`flex flex-row items-start justify-between gap-4`}>
          <Text style={tw`text-gray-700 font-bold text-[14px] mb-1`}>Activity:</Text>
          <View style={tw`font-bold text-lg border border-gray-300 rounded mb-3 h-[44px] w-[70%]`}>
            <Picker
              selectedValue={formData.activity}
              onValueChange={(value) => setFormData({ ...formData, activity: value })}
            >
              {activityList?.map((item, index) => (
                <Picker.Item key={index} label={item.item} value={item.item} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      <View style={tw`flex flex-row items-start justify-between gap-4`}>
        <Text style={tw`text-gray-700 font-bold text-[14px] mb-1`}>Location:</Text>
        <TextInput
          style={tw`font-bold text-[15px] border border-gray-300 px-2 h-[44px] rounded mb-3 w-[70%]`}
          placeholder="Enter Your Location"
          value={formData.location}
          onChangeText={(text) => setFormData({ ...formData, location: text })}
        />
      </View>

      <View style={tw`flex flex-row items-start justify-between gap-4`}>
        <Text style={tw`text-gray-700 font-bold text-[14px] mb-1`}>Current Time:</Text>
        <View style={tw`flex-1 border border-gray-300 rounded mb-3 max-w-[70%]`}>
          <TouchableOpacity onPress={() => setOpen(true)} style={tw`h-[44px] justify-center`}>
            <Text style={tw`text-gray-700 text-[15px]  px-2`}>
              {time ? time.toLocaleTimeString() : 'Select Time'}
            </Text>
          </TouchableOpacity>

          <DatePicker
            modal
            mode="time"
            open={open}
            date={time}
            onConfirm={(time) => {
              setOpen(false);
              setcurrentTime(time as unknown as string);
              setTime(time);
            }}
            onCancel={() => {
              setOpen(false);
            }}
          />
        </View>
      </View>

      <View style={tw`flex flex-row items-start justify-between gap-4`}>
        <Text style={tw`text-gray-700 font-bold text-[14px] mb-1`}>Choose:</Text>
        <View style={tw`flex flex-row items-start justify-between gap-4 w-[70%]`}>
          <View style={tw`font-bold text-lg border border-gray-300 rounded mb-3 flex-1`}>
            <Picker
              selectedValue={formData.truck}
              onValueChange={(value) => setFormData({ ...formData, truck: value })}
            >
              <Picker.Item label="trucklist" value="trucklist" />
              {trucklistandtailorlist?.trucklist?.map((option, index) => (
                <Picker.Item key={index} label={option.item} value={option.item} />
              ))}
            </Picker>
          </View>

          <View style={tw`font-bold text-lg border border-gray-300 rounded mb-3 flex-1`}>
            <Picker
              selectedValue={formData.trailer}
              onValueChange={(value) => setFormData({ ...formData, trailer: value })}
            >
              <Picker.Item label="trailerlist" value="trailerlist" />
              {trucklistandtailorlist?.trailerlist?.map((option, index) => (
                <Picker.Item key={index} label={option.item} value={option.item} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      <View style={tw`flex flex-row items-start justify-between gap-4`}>
        <Text style={tw`text-gray-700 font-bold text-[14px] mb-1`}>Odometer:</Text>
        <TextInput
          style={tw`font-bold text-[14px] border border-gray-300 px-2 h-[44px] rounded mb-3 w-[70%]`}
          placeholder="Enter Odometer Reading"
          value={formData.odometer}
          onChangeText={(text) => setFormData({ ...formData, odometer: text })}
        />
      </View>
    </View>
  );
};

export default FormSection;
