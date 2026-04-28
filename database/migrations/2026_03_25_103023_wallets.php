<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class Wallets extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id');
            $table->string('address');
            $table->string('public_key')->nullable();
            $table->string('type')->default("petra");

            $table->string('bot_address')->nullable();
            $table->longtext('bot_private_key')->nullable(); // lưu encrypted
            $table->string('subaccount_address')->nullable();
            $table->integer('onboarding_step')->default(0); // 0,1,2,3
            $table->boolean('is_onboarded')->default(false);
            $table->json('tx_hashes')->nullable();


            $table->string('api_key', 64)->unique()->nullable();
            $table->string('secret_key', 64)->nullable();    // hashed
            $table->longtext('secret_plain')->nullable();       // encrypted, show 1 lần

            $table->integer('status')->default(1);
            $table->timestamp('created_at')->default(\DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(\DB::raw('CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP'));
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('wallets');
    }
}
