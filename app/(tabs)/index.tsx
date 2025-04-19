import { Image, ScrollView, Text, View } from "react-native";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <>
      <View className="flex-1 bg-light-200">
        <Image
          source={icons.logo}
          className="w-12 h-10 mt-20 mb-5 mx-auto"
          resizeMode="contain"
        />
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
        >
          <View className="flex-1 mt-5">
            <SearchBar
              onPress={() => router.push("/table")}
              placeholder="Search for something"
            />
          </View>
        </ScrollView>
      </View>
    </>
  );
}
