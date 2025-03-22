import React from "react";
import { View, Text, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import tw from "twrnc";
import ActivityPicker from "./ActivityPicker";

const FormSection = ({
  formData,
  setFormData,
  activityList,
  trucklistandtailorlist,
}) => {
  const timeOptions = [
    "12:00 AM",
    "12:30 AM",
    "1:00 AM",
    "1:30 AM",
    "2:00 AM",
    "2:30 AM",
    "3:00 AM",
    "3:30 AM",
    "4:00 AM",
    "4:30 AM",
    "5:00 AM",
    "5:30 AM",
    "6:00 AM",
    "6:30 AM",
    "7:00 AM",
    "7:30 AM",
    "8:00 AM",
    "8:30 AM",
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
    "6:00 PM",
    "6:30 PM",
    "7:00 PM",
    "7:30 PM",
    "8:00 PM",
    "8:30 PM",
    "9:00 PM",
    "9:30 PM",
    "10:00 PM",
    "10:30 PM",
    "11:00 PM",
    "11:30 PM",
  ];

  return (
    <View style={tw`p-4`}>
      <View style={tw`p-4`}>
        <View style={tw`flex flex-row items-start justify-between gap-4`}>
          <Text style={tw`text-gray-700 font-bold text-[14px] mb-1`}>
            Activity:
          </Text>
          <View
            style={tw`font-bold text-lg border border-gray-300 rounded mb-3 w-[73%]`}
          >
            <Picker
              selectedValue={formData.activity}
              onValueChange={(value) =>
                setFormData({ ...formData, activity: value })
              }
            >
              {activityList?.map((item, index) => (
                <Picker.Item key={index} label={item.item} value={item.item} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      <View style={tw`flex flex-row items-start justify-between gap-4`}>
        <Text style={tw`text-gray-700 font-bold text-[14px] mb-1`}>
          Location:
        </Text>
        <TextInput
          style={tw`font-bold text-lg border border-gray-300 h-[54px] rounded mb-3 w-[73%]`}
          placeholder="Enter Your Location (Google)"
          value={formData.location}
          onChangeText={(text) => setFormData({ ...formData, location: text })}
        />
      </View>

      <View style={tw`flex flex-row items-start justify-between gap-4`}>
        <Text style={tw`text-gray-700 font-bold text-[14px] mb-1`}>
          Current Time:
        </Text>
        <View style={tw`flex-1 border border-gray-300 rounded mb-3`}>
          <Picker
            mode="dialog"
            selectedValue={formData.currentTime}
            onValueChange={(value) =>
              setFormData({ ...formData, currentTime: value })
            }
          >
            <Picker.Item label="By default Current Timestamp" value="" />
            {timeOptions?.map((option, index) => (
              <Picker.Item key={index} label={option} value={option} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={tw`flex flex-row items-start justify-between gap-4`}>
        <Text style={tw`text-gray-700 font-bold text-[14px] mb-1`}>
          Choose:
        </Text>
        <View
          style={tw`flex flex-row items-start justify-between gap-4 w-[73%]`}
        >
          <View
            style={tw`font-bold text-lg border border-gray-300 rounded mb-3 flex-1`}
          >
            <Picker
              selectedValue={formData.trailer}
              onValueChange={(value) =>
                setFormData({ ...formData, trailer: value })
              }
            >
              <Picker.Item label="trucklist" value="trucklist" />
              {trucklistandtailorlist?.trucklist?.map((option, index) => (
                <Picker.Item
                  key={index}
                  label={option.item}
                  value={option.item}
                />
              ))}
            </Picker>
          </View>

          <View
            style={tw`font-bold text-lg border border-gray-300 rounded mb-3 flex-1`}
          >
            <Picker
              selectedValue={formData.tractor}
              onValueChange={(value) =>
                setFormData({ ...formData, tractor: value })
              }
            >
              <Picker.Item label="trailerlist" value="trailerlist" />
              {trucklistandtailorlist?.trailerlist?.map((option, index) => (
                <Picker.Item
                  key={index}
                  label={option.item}
                  value={option.item}
                />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      <View style={tw`flex flex-row items-start justify-between gap-4`}>
        <Text style={tw`text-gray-700 font-bold text-[14px] mb-1`}>
          Odometer:
        </Text>
        <TextInput
          style={tw`font-bold text-lg border border-gray-300 p-3 rounded w-[73%]`}
          placeholder="Enter Odometer Reading"
          value={formData.odometer}
          onChangeText={(text) => setFormData({ ...formData, odometer: text })}
        />
      </View>
    </View>
  );
};

export default FormSection;
