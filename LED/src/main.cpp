#include <Arduino.h>
#include <LiquidCrystal.h>
// #include <Servo.h>
#include <VarSpeedServo.h>

// LiquidCrystal lcd(12, 11, 5, 4, 3, 2);x

VarSpeedServo servoHundreds, servoTens;

struct placeValue
{
  int hundreds;
  int tens;
  int ones;
  int tenths;
  int hundredths;
};

String getTicker()
{
  String ticker = Serial.readStringUntil('$');
  ticker.trim();

  return ticker;
}

String getPrice()
{
  String price = Serial.readString();
  price.trim();

  return price;
}

placeValue setAngles(String price)
{
  struct placeValue angle;

  angle.hundreds = map(String(price[0]).toInt(), 0, 9, 0, 180);
  angle.tens = map(String(price[1]).toInt(), 0, 9, 0, 175);
  angle.ones = map(String(price[2]).toInt(), 0, 9, 0, 179);
  angle.tenths = map(String(price[4]).toInt(), 0, 9, 0, 179);
  angle.hundredths = map(String(price[5]).toInt(), 0, 9, 0, 179);

  return angle;
}

void turnServos(placeValue angle);

void setup()
{
  // put your setup code here, to run once:
  Serial.begin(9600);
  // lcd.begin(16, 2);
  // lcd.clear();
  servoHundreds.attach(13);
  servoTens.attach(12);
}

void loop()
{
  // put your main code here, to run repeatedly:
  if (Serial.available() > 0)
  {
    String ticker = getTicker();

    String price = getPrice();

    struct placeValue angle = setAngles(price);
    turnServos(angle);
  }
}

void turnServos(placeValue angle)
{

  int servoAngleHundreds = servoHundreds.read();
  if (angle.hundreds >= 80)
  {
    angle.hundreds = angle.hundreds - 10;
  }
  else if (servoAngleHundreds > angle.hundreds)
  {
    angle.hundreds = angle.hundreds - 10;
  }

  servoHundreds.write(angle.hundreds, 124, true);
  servoTens.write(angle.tens, 124, true);
}
