import * as React from "react";
import { Text, View, StyleSheet, Button, Image } from "react-native";
import { Audio } from "expo-av";

let ativo = false;

export default function App() {
  const [recording, setRecording] = React.useState();
  const [decibeis, setDecibeis] = React.useState(0);

  async function startRecording() {
    try {
      console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync();
      setRecording(recording);
      setInterval(async () => {
        let { metering, isRecording } = await recording.getStatusAsync();
        console.log("metering", metering, ativo);

        setDecibeis(metering);

        if (metering >= -15 && !ativo) {
          ativo = true;
          bolinha();
        }
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    console.log("Stopping recording..");
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    console.log("Recording stopped and stored at", uri);
  }

  let bolinha = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("./assets/bolinha.m4a")
    );

    console.log("Playing Sound");
    await sound.playAsync();

    setTimeout(() => {
      ativo = false;
    }, 30000);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("./assets/dog.png")}
        style={[
          styles.img,
          { borderColor: decibeis >= -50 && recording ? "#CDD5C6" : "#FFE2C3" },
        ]}
      />
      <Button
        title={recording ? "Encerrar Monitoramento" : "Iniciar Monitoramento"}
        onPress={recording ? stopRecording : startRecording}
      />
      {/* <Button title={"Bolinha"} onPress={() => bolinha()}></Button> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    backgroundColor: "#FBF2ED",
    padding: 10,
  },

  img: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 10,
    marginBottom: 20,
  },
});
