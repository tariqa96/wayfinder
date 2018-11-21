import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import DirectionsView from './MapScreen';
import MapScreen from './MapScreen';
import { AsyncStorage } from "react-native"



const APP_ID = "171287213807359";
//const APP_URL = "http://128.189.94.150:8080";
const APP_URL = "http://104.211.14.232:8080";
const FB_AUTH = "/auth/fb/";

class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { email: 'Test@test.com', password: '123456', error: '', loading: false, token: null };
  }

  static navigationOptions = {
    title: 'UBC WayFinder',
  };

  gotoMapScreen = () => {
    this.props.navigation.navigate('MapScreen');
  }

  loginFailedAlert = () => {
    Alert.alert("Login Failed please try again");
  }

  logIn = async function (view) {
    {/* view.gotoMapScreen();*/}
    try {
      const {
        type,
        token
      } = await Expo.Facebook.logInWithReadPermissionsAsync(APP_ID, {
        permissions: ['public_profile']
      });

      if (type === 'success') {
        {/* Request JWT from server */}
        await view.getJWT(token).then(() => {
          if(!view.state.token) {
            view.loginFailedAlert();
          } else {
            // TODO delete
            view.gotoMapScreen();
          }
        });
      } else {
        view.loginFailedAlert();
      }
    } catch (e) {
      alert(`Facebook Login Error: ` + e);
    }
  }

  getJWT = async (fbToken) => {
    return fetch(APP_URL + FB_AUTH, {
      method: "POST",
      headers: new Headers({
        'Authorization': 'Bearer ' + fbToken
      })
    }).then((res) => {
      if (res.status == 200) {
        return this.extractToken(res);
      } else {
        this.loginFailedAlert();
        return;
      }
    });
  }

  extractToken = async (res) => {
    return res.json().then( async (jsonBody) => {
      if (!jsonBody.token) {
        this.loginFailedAlert();
        console.log("Failed here at .json getJWT");
        console.log(jsonBody);
        return;
      } else {
        this.setState({ token: jsonBody.token })
        await AsyncStorage.setItem('@tokenStore:token', jsonBody.token);
        // TODO remove
        console.log(jsonBody.token);
        console.log("stored user token successfully");
      }
    });
  }

  render() {
    //const { navigate } = this.props.navigation;
    return (
      <View style={{
        width: "100%",
        height: 80,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        bottom: 300,
        backgroundColor: "rgba(255, 255, 255, 0.0)"
      }}>
        <Button testID="loginButton" 
          title="Login-with Facebook"
          onPress={() => this.logIn(this)}
        />
      </View>
    );
  }
}

const App = createStackNavigator({
  LoginScreen: { screen: LoginScreen },
  MapScreen: { screen: MapScreen },
}, {
    initialRouteName: 'LoginScreen',
  });

export default App;