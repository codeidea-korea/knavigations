package com.knavigations;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;

import java.util.Timer;
import java.util.TimerTask;

public class SplashActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        startActivity(new Intent(SplashActivity.this, MainActivity.class));
        finish();
        /*
        TimerTask timerTask = new TimerTask() {
            @Override
            public void run() {

                SplashActivity.this.finish();
//                overridePendingTransition(R.anim.fadenone, R.anim.fadenone);
            }
        };
        Timer timer = new Timer();
        timer.schedule(timerTask, 2000);

         */
    }

    @Override
    public void onBackPressed() {
        finish();
    }
}