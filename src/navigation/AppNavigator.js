import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";

import WelcomeScreen from "../screens/WelcomeScreen";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ClientScreen from "../screens/ClientScreen";
import ClientRequestsScreen from "../screens/ClientRequestsScreen";
import RequestsScreen from "../screens/RequestsScreen";
import MesRequestsScreen from "../screens/MesRequestsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ChatScreen from "../screens/ChatScreen";
import TrackingScreen from "../screens/TrackingScreen";
import AdminNoticeScreen from "../screens/AdminNoticeScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import { AuthContext } from "../context/AuthContext";
import AppDrawerContent from "../components/AppDrawerContent";
import DrawerMenuButton from "../components/DrawerMenuButton";
import theme from "../utils/theme";

const RootStack = createStackNavigator();
const AuthStack = createStackNavigator();
const Drawer = createDrawerNavigator();
const TOKEN_KEY = "token";
const USER_KEY = "user";

const clearSessionStorage = async () => {
  await Promise.all([AsyncStorage.removeItem(TOKEN_KEY), AsyncStorage.removeItem(USER_KEY)]);
};

function HeaderTitle({ title }) {
  return (
    <View style={styles.headerTitleWrapper}>
      <Text style={styles.headerLogo}>🚚</Text>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

function HeaderTitleDark({ title }) {
  return (
    <View style={styles.headerTitleWrapper}>
      <Text style={styles.headerLogo}>🚚</Text>
      <Text style={styles.headerTitleDark}>{title}</Text>
    </View>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      initialRouteName="Welcome"
      screenOptions={({ navigation, route }) => ({
        headerTitle: () => (
          <HeaderTitle
            title={
              route.name === "Login" ? "Connexion" : route.name === "Register" ? "Inscription" : "Bienvenue"
            }
          />
        ),
        headerTitleAlign: "center",
        headerStyle: styles.headerStyle,
        cardStyleInterpolator: ({ current, layouts }) => ({
          cardStyle: {
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width, 0],
                }),
              },
            ],
          },
        }),
        headerLeft: () =>
          navigation.canGoBack() ? (
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>←</Text>
            </Pressable>
          ) : null,
      })}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function AuthRootWithBootstrapOverlay() {
  const { isRestoring } = React.useContext(AuthContext);
  return (
    <View style={styles.authRoot}>
      <AuthNavigator />
      {isRestoring ? (
        <View style={styles.bootstrapOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : null}
    </View>
  );
}

function drawerScreenOptions(navigation, { darkHeader = false } = {}) {
  return {
    headerTitleAlign: "center",
    headerStyle: darkHeader ? styles.headerStyleDark : styles.headerStyle,
    headerLeft: () => <DrawerMenuButton navigation={navigation} variant={darkHeader ? "dark" : "default"} />,
  };
}

function ClientAppDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        ...drawerScreenOptions(navigation),
        drawerType: "front",
        drawerStyle: styles.drawerPanel,
        overlayColor: "rgba(15, 23, 42, 0.45)",
        swipeEnabled: true,
        swipeEdgeWidth: 48,
      })}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Accueil",
          headerTitle: () => <HeaderTitle title="Accueil" />,
        }}
      />
      <Drawer.Screen
        name="Client"
        component={ClientScreen}
        options={{
          title: "Demande",
          headerTitle: () => <HeaderTitle title="Créer une demande" />,
        }}
      />
      <Drawer.Screen
        name="ClientRequests"
        component={ClientRequestsScreen}
        options={{
          title: "Mes demandes",
          headerTitle: () => <HeaderTitle title="Mes demandes" />,
        }}
      />
      <Drawer.Screen
        name="Tracking"
        component={TrackingScreen}
        options={{
          title: "Tracking",
          headerTitle: () => <HeaderTitle title="Suivi colis" />,
        }}
      />
      <Drawer.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: "Chat",
          headerTitle: () => <HeaderTitle title="Messagerie" />,
        }}
      />
      <Drawer.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: "Notifications",
          headerTitle: () => <HeaderTitle title="Notifications" />,
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation }) => ({
          title: "Profil",
          headerTitle: () => <HeaderTitleDark title="Profil" />,
          ...drawerScreenOptions(navigation, { darkHeader: true }),
        })}
      />
    </Drawer.Navigator>
  );
}

function TransporteurAppDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        ...drawerScreenOptions(navigation),
        drawerType: "front",
        drawerStyle: styles.drawerPanel,
        overlayColor: "rgba(15, 23, 42, 0.45)",
        swipeEnabled: true,
        swipeEdgeWidth: 48,
      })}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Accueil",
          headerTitle: () => <HeaderTitle title="Accueil" />,
        }}
      />
      <Drawer.Screen
        name="Requests"
        component={RequestsScreen}
        options={{
          title: "Disponibles",
          headerTitle: () => <HeaderTitle title="Demandes disponibles" />,
        }}
      />
      <Drawer.Screen
        name="MesRequests"
        component={MesRequestsScreen}
        options={{
          title: "Mes trajets",
          headerTitle: () => <HeaderTitle title="Mes trajets" />,
        }}
      />
      <Drawer.Screen
        name="Tracking"
        component={TrackingScreen}
        options={{
          title: "Tracking",
          headerTitle: () => <HeaderTitle title="Suivi colis" />,
        }}
      />
      <Drawer.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: "Chat",
          headerTitle: () => <HeaderTitle title="Messagerie" />,
        }}
      />
      <Drawer.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: "Notifications",
          headerTitle: () => <HeaderTitle title="Notifications" />,
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation }) => ({
          title: "Profil",
          headerTitle: () => <HeaderTitleDark title="Profil" />,
          ...drawerScreenOptions(navigation, { darkHeader: true }),
        })}
      />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const rawUser = await AsyncStorage.getItem(USER_KEY);
        if (savedToken && rawUser) {
          const parsed = JSON.parse(rawUser);
          setToken(savedToken);
          setUser(parsed);
        } else {
          setToken(null);
          setUser(null);
        }
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    };

    restoreSession();
  }, []);

  const authContextValue = useMemo(
    () => ({
      token,
      user,
      isRestoring: isBootstrapping,
      signIn: async ({ token: newToken, user: newUser }) => {
        await AsyncStorage.setItem(TOKEN_KEY, newToken);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
      },
      signOut: async () => {
        await clearSessionStorage();
        setToken(null);
        setUser(null);
      },
    }),
    [token, user, isBootstrapping]
  );

  const role = String(user?.role || "").trim().toLowerCase();
  const isAuthenticated = Boolean(token);
  const showMainApp = !isBootstrapping && isAuthenticated;

  return (
    <AuthContext.Provider value={authContextValue}>
      <NavigationContainer>
        <RootStack.Navigator
          key={showMainApp ? `app-${role || "user"}` : "auth"}
          screenOptions={{ headerShown: false }}
        >
          {showMainApp ? (
            role === "admin" ? (
              <RootStack.Screen name="AdminApp" component={AdminNoticeScreen} />
            ) : role === "client" ? (
              <RootStack.Screen name="ClientApp" component={ClientAppDrawer} />
            ) : role === "transporteur" ? (
              <RootStack.Screen name="TransporteurApp" component={TransporteurAppDrawer} />
            ) : (
              <RootStack.Screen name="UserApp" component={ClientAppDrawer} />
            )
          ) : (
            <RootStack.Screen name="Auth" component={AuthRootWithBootstrapOverlay} />
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  authRoot: {
    flex: 1,
  },
  bootstrapOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.55)",
  },
  headerStyle: {
    backgroundColor: theme.colors.white,
    ...theme.shadows.header,
  },
  headerTitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerLogo: {
    fontSize: 18,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  headerTitleDark: {
    color: theme.colors.headerDarkText,
    fontSize: 16,
    fontWeight: "700",
  },
  headerStyleDark: {
    backgroundColor: theme.colors.headerDarkBg,
    ...theme.shadows.headerDark,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.headerDarkBorderBottom,
  },
  backButton: {
    marginLeft: 12,
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primaryLight,
  },
  backText: {
    color: theme.colors.primary,
    fontWeight: "800",
    fontSize: 18,
  },
  drawerPanel: {
    width: "82%",
    maxWidth: 320,
    backgroundColor: theme.colors.white,
    borderTopRightRadius: theme.radius.xxl,
    borderBottomRightRadius: theme.radius.xxl,
    overflow: "hidden",
  },
});
