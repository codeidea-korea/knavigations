package com.knavigations;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;

import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {
  static final int PERMISSION_REQUEST = 0x00001;

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "knavigations";
  }

  long backKeyPressedTime;

  @Override
  public void onBackPressed() {
    if(System.currentTimeMillis() > backKeyPressedTime+2000){
      backKeyPressedTime = System.currentTimeMillis();
      Toast.makeText(this, getString(R.string.APP_CLOSE_BACK_BUTTON), Toast.LENGTH_SHORT).show();
    } else {
      AppFinish();
    }
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
//        mHandler.sendEmptyMessageDelayed(1, 2000);

    if (ActivityCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED
            || ActivityCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED)
    {
      ActivityCompat.requestPermissions(this, new String[]{
              Manifest.permission.RECORD_AUDIO
              , Manifest.permission.WRITE_EXTERNAL_STORAGE
      }, PERMISSION_REQUEST);
    } else {
    }
  }

  @Override
  public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
    switch (requestCode){
      case PERMISSION_REQUEST:
        if (grantResults[0] != PackageManager.PERMISSION_GRANTED
                || grantResults[1] != PackageManager.PERMISSION_GRANTED)
        {
          Toast.makeText(this, "앱 실행을 위해 모든 권한을 허용해 주셔야 합니다.", Toast.LENGTH_LONG);
          AppFinish();
        } else {
        }
        break;
    }
  }

  public void AppFinish(){
    finish();
    System.exit(0);
    android.os.Process.killProcess(android.os.Process.myPid());
  }
}
